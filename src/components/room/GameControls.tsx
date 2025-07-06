"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomDto, PlayerState, RoomState } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'

interface GameControlsProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const GameControls: React.FC<GameControlsProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected } = useSignalR()

  const handleStartGame = async () => {
    if (!connection || !isConnected || !playerState?.isHost) return
    
    try {
      await connection.invoke('StartGame', roomData.code)
    } catch (error) {
      console.error('Failed to start game:', error)
      onError('Failed to start game. Please try again.')
    }
  }

  if (roomData.state !== RoomState.Waiting) {
    return null
  }

  return (
    <Card className="backdrop-blur-sm bg-white/90">
      <CardContent className="p-6">
        <div className="space-y-4">
          {playerState?.isHost ? (
            <>
              <p className="text-center text-gray-600">
                You are the host. Start the game when ready!
              </p>
              <Button 
                onClick={handleStartGame} 
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={roomData.players.length < 2}
              >
                Start Game
              </Button>
              {roomData.players.length < 2 && (
                <p className="text-sm text-gray-500 text-center">
                  Need at least 2 players to start
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-600">
              Waiting for the host to start the game...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}