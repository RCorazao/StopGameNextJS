"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayerState, RoomDto, RoomState } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'
import { PlayersList } from './PlayersList'
import { RoomSettings } from './RoomSettings'

interface RoomWaitingProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoomWaiting: React.FC<RoomWaitingProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected } = useSignalR()

  // Listen for RoomUpdated events to detect state changes
  useEffect(() => {
    if (!connection || !isConnected) return

    const handleRoomUpdated = (room: RoomDto) => {
      console.log('Room updated in waiting component:', room.state)
      // No need to update state here as the parent component will handle it
    }

    // Add event listener
    connection.on('RoomUpdated', handleRoomUpdated)

    // Cleanup event listener
    return () => {
      connection.off('RoomUpdated', handleRoomUpdated)
    }
  }, [connection, isConnected])

  return (
    <>
      <PlayersList roomData={roomData} playerState={playerState} />
      
      <RoomSettings 
        roomData={roomData} 
        playerState={playerState!} 
        onError={onError}
      />
    </>
  )
}