"use client"

import { useState, useEffect } from 'react'
import { useSignalR } from '@/contexts/SignalRContext'
import { RoomDto } from '@/types/signalr'

export const useRoom = (roomCode?: string) => {
  const { connection, isConnected, playerState } = useSignalR()
  const [roomData, setRoomData] = useState<RoomDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Do nothing if not connected or if there is no valid player/room association
    if (!connection || !isConnected) return
    if (!roomCode) return
    if (!playerState || playerState.roomCode !== roomCode) return

    let isActive = true

    // Set up SignalR event listeners
    const handleRoomCreated = (room: RoomDto) => {
      if (!isActive) return
      console.log('Room created, received room:', room)
      setRoomData(room)
      setIsLoading(false)
      setError('')
    }

    const handleRoomJoined = (room: RoomDto) => {
      if (!isActive) return
      console.log('Room joined, received room:', room)
      setRoomData(room)
      setIsLoading(false)
      setError('')
    }

    const handleRoomUpdated = (room: RoomDto) => {
      if (!isActive) return
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
      if (!isActive) return
      console.log('Round started:', room)
      setRoomData(room)
    }

    const handleRoundStopped = () => {
      if (!isActive) return
      console.log('Round ended - signal received')
      // RoundStopped event doesn't contain room data, just a signal
    }

    const handleError = (error: string) => {
      if (!isActive) return
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

    // Rejoin room on connection - only if playerState matches the current room
    const rejoinRoom = async () => {
      try {
        if (!playerState || playerState.roomCode !== roomCode) return
        await connection.invoke('GetCurrentRoom')
      } catch (err) {
        // If the component unmounted or the user left in the meantime, ignore the error
        if (!isActive || !playerState || playerState.roomCode !== roomCode) return
        console.error('Failed to rejoin room:', err)
        setError('Failed to connect to room')
        setIsLoading(false)
      }
    }

    rejoinRoom()

    // Cleanup event listeners
    return () => {
      isActive = false
      connection.off('RoomCreated', handleRoomCreated)
      connection.off('RoomJoined', handleRoomJoined)
      connection.off('Error', handleError)
      connection.off('RoomUpdated', handleRoomUpdated)
      connection.off('RoundStarted', handleRoundStarted)
      connection.off('RoundStopped', handleRoundStopped)
    }
  }, [connection, isConnected, roomCode, playerState?.roomCode])

  return {
    roomData,
    isLoading,
    error,
    setError
  }
}