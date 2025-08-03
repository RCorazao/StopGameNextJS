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
      setRoomData(room)
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