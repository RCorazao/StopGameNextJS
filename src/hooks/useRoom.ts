"use client"

import { useState, useEffect } from 'react'
import { useSignalR } from '@/contexts/SignalRContext'
import { RoomDto } from '@/types/signalr'

export const useRoom = (roomCode: string) => {
  const { connection, isConnected } = useSignalR()
  const [roomData, setRoomData] = useState<RoomDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!connection || !isConnected) return

    // Set up SignalR event listeners
    const handleRoomCreated = (room: RoomDto) => {
      console.log('Room created, received room:', room)
      setRoomData(room)
      setIsLoading(false)
      setError('')
    }

    const handleRoomJoined = (room: RoomDto) => {
      console.log('Room joined, received room:', room)
      setRoomData(room)
      setIsLoading(false)
      setError('')
    }

    const handleRoomUpdated = (room: RoomDto) => {
      console.log('Room updated:', room)
      
      // Only update if there are meaningful changes to avoid unnecessary re-renders
      setRoomData(prevRoom => {
        if (!prevRoom) return room
        
        // Always update if room state changes
        if (prevRoom.state !== room.state) {
          console.log(`Room state changed from ${prevRoom.state} to ${room.state}`)
          return room
        }
        
        // State-specific update logic
        switch (room.state) {
          case 0: // Waiting
            // Update for any player changes or settings changes
            return room
            
          case 1: // Playing
            // Update for round changes or player changes
            const roundChanged = (
              prevRoom.currentRound?.isActive !== room.currentRound?.isActive ||
              prevRoom.currentRound?.id !== room.currentRound?.id ||
              prevRoom.currentRound?.letter !== room.currentRound?.letter
            )
            return roundChanged || prevRoom.players.length !== room.players.length ? room : prevRoom
            
          case 2: // Voting
            // Only update if player count changes during voting
            return prevRoom.players.length !== room.players.length ? room : prevRoom
            
          case 3: // Results
            // Always update for score changes
            return room
            
          case 4: // Finished
            // Only update for player changes
            return prevRoom.players.length !== room.players.length ? room : prevRoom
            
          default:
            return room
        }
      })
    }

    const handleRoundStarted = (room: RoomDto) => {
      console.log('Round started:', room)
      setRoomData(room)
    }

    const handleRoundStopped = () => {
      console.log('Round ended - signal received')
      // RoundStopped event doesn't contain room data, just a signal
    }

    const handleError = (error: string) => {
      console.error('SignalR error:', error)
      setError(error)
      setIsLoading(false)
    }

    // Add event listeners
    connection.on('RoomCreated', handleRoomCreated)
    connection.on('RoomJoined', handleRoomJoined)
    connection.on('Error', handleError)
    connection.on('RoomUpdated', handleRoomUpdated)
    connection.on('RoundStarted', handleRoundStarted)
    connection.on('RoundStopped', handleRoundStopped)

    // Rejoin room on connection
    const rejoinRoom = async () => {
      try {
        await connection.invoke('GetCurrentRoom')
      } catch (error) {
        console.error('Failed to rejoin room:', error)
        setError('Failed to connect to room')
        setIsLoading(false)
      }
    }

    rejoinRoom()

    // Cleanup event listeners
    return () => {
      connection.off('RoomCreated', handleRoomCreated)
      connection.off('RoomJoined', handleRoomJoined)
      connection.off('Error', handleError)
      connection.off('RoomUpdated', handleRoomUpdated)
      connection.off('RoundStarted', handleRoundStarted)
      connection.off('RoundStopped', handleRoundStopped)
    }
  }, [connection, isConnected, roomCode])

  return {
    roomData,
    isLoading,
    error,
    setError
  }
}