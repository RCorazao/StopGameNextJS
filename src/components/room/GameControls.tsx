"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomDto, PlayerState, RoomState } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface GameControlsProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const GameControls: React.FC<GameControlsProps> = ({ roomData, playerState, onError }) => {
  const { startRound } = useSignalR()
  const { t } = useLanguage()

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
                    ? t.youAreHost
                    : t.readyNextRound}
                </p>
                <Button 
                  onClick={handleStartRound} 
                  className={`w-full ${isFirstRound ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  disabled={isFirstRound && roomData.players.length < 2}
                >
                  {t.startRound} {roundNumber}
                </Button>
                {isFirstRound && roomData.players.length < 2 && (
                  <p className="text-sm text-gray-500 text-center">
                    {t.needTwoPlayers}
                  </p>
                )}
              </>
            ) : (
              <p className="text-center text-gray-600">
                {isFirstRound 
                  ? t.waitingHostStart
                  : t.waitingHostNextRound}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}