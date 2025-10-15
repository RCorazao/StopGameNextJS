"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomDto, PlayerState } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface RoomResultsProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoomResults: React.FC<RoomResultsProps> = ({ roomData, playerState, onError }) => {
  const { startRound } = useSignalR()
  const { t } = useLanguage()

  // Listen for RoomUpdated events to detect state changes
  // useEffect(() => {
  //   if (!connection || !isConnected) return

  //   const handleRoomUpdated = (room: RoomDto) => {
  //     console.log('Room updated in results component:', room.state)
  //     // No need to update state here as the parent component will handle it
  //   }

  //   // Add event listener
  //   connection.on('RoomUpdated', handleRoomUpdated)

  //   // Cleanup event listener
  //   return () => {
  //     connection.off('RoomUpdated', handleRoomUpdated)
  //   }
  // }, [connection, isConnected])

  const handleStartNextRound = async () => {
    if (!playerState?.isHost) return
    
    try {
      await startRound()
    } catch (error) {
      console.error('Failed to start next round:', error)
      onError('Failed to start next round')
    }
  }

  // Sort players by score in descending order
  const sortedPlayers = [...roomData.players].sort((a, b) => b.score - a.score)

  return (
    <Card className="backdrop-blur-sm bg-white/80">
      <CardHeader>
        <CardTitle>{t.roundResults}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t.scores}</h3>
            <div className="divide-y">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className="py-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{player.name}</span>
                    {player.id === playerState?.id && (
                      <span className="ml-2 text-sm text-muted-foreground">({t.you})</span>
                    )}
                  </div>
                  <span className="font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          {playerState?.isHost && (
            <Button 
              onClick={handleStartNextRound} 
              className="w-full mt-4"
            >
              {t.startNextRound}
            </Button>
          )}

          {!playerState?.isHost && (
            <div className="text-center mt-4">
              <p>{t.waitingHostNextRound}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}