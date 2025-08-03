"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomDto, PlayerState } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'
import { useRouter } from 'next/navigation'

interface RoomFinishedProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoomFinished: React.FC<RoomFinishedProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected, leaveRoom } = useSignalR()
  const router = useRouter()

  // Listen for RoomUpdated events to detect state changes
  useEffect(() => {
    if (!connection || !isConnected) return

    const handleRoomUpdated = (room: RoomDto) => {
      console.log('Room updated in finished component:', room.state)
      // No need to update state here as the parent component will handle it
    }

    // Add event listener
    connection.on('RoomUpdated', handleRoomUpdated)

    // Cleanup event listener
    return () => {
      connection.off('RoomUpdated', handleRoomUpdated)
    }
  }, [connection, isConnected])

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom()
      router.push('/')
    } catch (error) {
      console.error('Failed to leave room:', error)
      onError('Failed to leave room')
    }
  }

  // Sort players by score in descending order
  const sortedPlayers = [...roomData.players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]

  return (
    <Card className="backdrop-blur-sm bg-white/80">
      <CardHeader>
        <CardTitle>Game Finished</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Winner</h2>
            <div className="text-3xl font-extrabold">{winner?.name}</div>
            <div className="text-xl font-bold mt-1">{winner?.score} points</div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Final Scores</h3>
            <div className="divide-y">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className="py-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{player.name}</span>
                    {player.id === playerState?.id && (
                      <span className="ml-2 text-sm text-muted-foreground">(You)</span>
                    )}
                  </div>
                  <span className="font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleLeaveRoom} 
            className="w-full mt-4"
          >
            Leave Room
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}