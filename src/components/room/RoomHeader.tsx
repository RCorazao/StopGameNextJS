"use client"

import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { RoomDto, RoomState } from '@/types/signalr'
import { useLanguage } from '@/contexts/LanguageContext'

interface RoomHeaderProps {
  roomData: RoomDto
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomData }) => {
  const { t } = useLanguage()
  
  return (
    <Card className="backdrop-blur-sm bg-white/90">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          {t.room}: {roomData.code}
        </CardTitle>
        <CardDescription>
          {roomData.players.length} / {roomData.maxPlayers} {t.players.toLowerCase()}
          {roomData.state === RoomState.Waiting && ` • ${t.waitingForPlayers}`}
          {roomData.state === RoomState.Playing && (
            roomData.currentRound 
              ? ` • ${t.round} ${roomData.rounds.length} - ${t.letter}: ${roomData.currentRound.letter.toUpperCase()}`
              : ` • ${t.gameInProgress}`
          )}
          {roomData.state === RoomState.Voting && ` • ${t.votingPhase}`}
          {roomData.state === RoomState.Finished && ` • ${t.gameFinished}`}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}