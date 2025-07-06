"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { CreateRoomRequest, JoinRoomRequest, RoomDto, SignalRContextType, PlayerState } from '@/types/signalr'

const SignalRContext = createContext<SignalRContextType | undefined>(undefined)

interface SignalRProviderProps {
  children: ReactNode
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [isConnected, setIsConnected] = useState(false)
  const [playerState, setPlayerState] = useState<PlayerState | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('playerState')
      return saved ? JSON.parse(saved) : null
    }
    return null
  })

  // Save player state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (playerState) {
        localStorage.setItem('playerState', JSON.stringify(playerState))
      } else {
        localStorage.removeItem('playerState')
      }
    }
  }, [playerState])

  useEffect(() => {
    const hubUrl = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || '/gameHub'
    
    // Create SignalR connection
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build()

    // Set up connection event handlers
    newConnection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error)
      setConnectionState('Reconnecting')
      setIsConnected(false)
    })

    newConnection.onreconnected((connectionId) => {
      console.log('SignalR reconnected with ID:', connectionId)
      setConnectionState('Connected')
      setIsConnected(true)
    })

    newConnection.onclose((error) => {
      console.log('SignalR connection closed:', error)
      setConnectionState('Disconnected')
      setIsConnected(false)
    })

    // Start the connection
    const startConnection = async () => {
      try {
        setConnectionState('Connecting')
        await newConnection.start()
        console.log('SignalR connected with ID:', newConnection.connectionId)
        setConnectionState('Connected')
        setIsConnected(true)
        setConnection(newConnection)
      } catch (error) {
        console.error('SignalR connection failed:', error)
        setConnectionState('Failed')
        setIsConnected(false)
      }
    }

    startConnection()

    // Cleanup on unmount
    return () => {
      if (newConnection) {
        newConnection.stop()
      }
    }
  }, [])

  const createRoom = async (hostName: string, options?: Partial<CreateRoomRequest>): Promise<RoomDto | null> => {
    if (!connection || !isConnected) {
      console.error('SignalR not connected')
      return null
    }

    return new Promise((resolve, reject) => {
      // Set up one-time event listeners
      const handleRoomCreated = (room: RoomDto) => {
        console.log('Room created:', room)
        connection.off('RoomCreated', handleRoomCreated)
        connection.off('Error', handleError)
        resolve(room)
      }

      const handleError = (errorMessage: string) => {
        console.error('Failed to create room:', errorMessage)
        connection.off('RoomCreated', handleRoomCreated)
        connection.off('Error', handleError)
        reject(new Error(errorMessage))
      }

      // Register event listeners
      connection.on('RoomCreated', handleRoomCreated)
      connection.on('Error', handleError)

      // Prepare request with defaults
      const request: CreateRoomRequest = {
        hostName,
        customTopics: options?.customTopics || [],
        useDefaultTopics: options?.useDefaultTopics ?? true,
        maxPlayers: options?.maxPlayers || 8,
        roundDurationSeconds: options?.roundDurationSeconds || 60,
        votingDurationSeconds: options?.votingDurationSeconds || 30,
        maxRounds: options?.maxRounds || 5
      }

      // Send request to server
      connection.invoke('CreateRoom', request).catch((error) => {
        console.error('Failed to invoke CreateRoom:', error)
        connection.off('RoomCreated', handleRoomCreated)
        connection.off('Error', handleError)
        reject(error)
      })
    })
  }

  const joinRoom = async (roomCode: string, playerName: string): Promise<RoomDto | null> => {
    if (!connection || !isConnected) {
      console.error('SignalR not connected')
      return null
    }

    return new Promise((resolve, reject) => {
      // Set up one-time event listeners
      const handleRoomJoined = (room: RoomDto) => {
        console.log('Room joined:', room)
        connection.off('RoomJoined', handleRoomJoined)
        connection.off('Error', handleError)
        resolve(room)
      }

      const handleError = (errorMessage: string) => {
        console.error('Failed to join room:', errorMessage)
        connection.off('RoomJoined', handleRoomJoined)
        connection.off('Error', handleError)
        reject(new Error(errorMessage))
      }

      // Register event listeners
      connection.on('RoomJoined', handleRoomJoined)
      connection.on('Error', handleError)

      // Prepare request
      const request: JoinRoomRequest = {
        roomCode,
        playerName
      }

      // Send request to server
      connection.invoke('JoinRoom', request).catch((error) => {
        console.error('Failed to invoke JoinRoom:', error)
        connection.off('RoomJoined', handleRoomJoined)
        connection.off('Error', handleError)
        reject(error)
      })
    })
  }

  const leaveRoom = async (): Promise<void> => {
    if (!connection || !isConnected) {
      return
    }

    try {
      await connection.invoke('LeaveRoom')
      console.log('Left room successfully')
      // Clear player state when leaving room
      setPlayerState(null)
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  const contextValue: SignalRContextType = {
    connection,
    connectionState,
    isConnected,
    playerState,
    setPlayerState,
    createRoom,
    joinRoom,
    leaveRoom
  }

  return (
    <SignalRContext.Provider value={contextValue}>
      {children}
    </SignalRContext.Provider>
  )
}

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext)
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider')
  }
  return context
}

export default SignalRContext