"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { RoomDto } from '@/types/signalr'

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
          {roomData.state === 'waiting' && ' • Waiting for players'}
          {roomData.state === 'playing' && roomData.currentRound && ` • Round -`}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}