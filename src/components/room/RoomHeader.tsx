"use client"

import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { RoomDto, RoomState } from '@/types/signalr'

interface RoomHeaderProps {
  roomData: RoomDto
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomData }) => {
  return (
    <Card className="backdrop-blur-sm bg-white/90">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          Room: {roomData.code}
        </CardTitle>
        <CardDescription>
          {roomData.players.length} / {roomData.maxPlayers} players
          {roomData.state === RoomState.Waiting && ' • Waiting for players'}
          {roomData.state === RoomState.Playing && (
            roomData.currentRound 
              ? ` • Round ${roomData.rounds.length} - Letter: ${roomData.currentRound.letter.toUpperCase()}`
              : ' • Game in progress'
          )}
          {roomData.state === RoomState.Voting && ' • Voting phase'}
          {roomData.state === RoomState.Finished && ' • Game finished'}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}