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
  const { connection, isConnected, startRound } = useSignalR()

  const handleStartRound = async () => {
    if (!playerState?.isHost) return
    
    try {
      await startRound()
    } catch (error) {
      console.error('Failed to start round:', error)
      onError('Failed to start round. Please try again.')
    }
  }

  // Show start round button when waiting or when playing but no active round
  if (roomData.state === RoomState.Waiting || 
      (roomData.state === RoomState.Playing && (!roomData.currentRound || !roomData.currentRound.isActive))) {
    
    const isFirstRound = roomData.state === RoomState.Waiting
    const roundNumber = (roomData.rounds?.length || 0) + 1
    
    return (
      <Card className="backdrop-blur-sm bg-white/90">
        <CardContent className="p-6">
          <div className="space-y-4">
            {playerState?.isHost ? (
              <>
                <p className="text-center text-gray-600">
                  {isFirstRound 
                    ? "You are the host. Start the first round when ready!" 
                    : "Ready to start the next round?"}
                </p>
                <Button 
                  onClick={handleStartRound} 
                  className={`w-full ${isFirstRound ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  disabled={isFirstRound && roomData.players.length < 2}
                >
                  Start Round {roundNumber}
                </Button>
                {isFirstRound && roomData.players.length < 2 && (
                  <p className="text-sm text-gray-500 text-center">
                    Need at least 2 players to start
                  </p>
                )}
              </>
            ) : (
              <p className="text-center text-gray-600">
                {isFirstRound 
                  ? "Waiting for the host to start the game..." 
                  : "Waiting for the host to start the next round..."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}