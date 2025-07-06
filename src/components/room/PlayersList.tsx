"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'
import { RoomDto, PlayerState } from '@/types/signalr'

interface PlayersListProps {
  roomData: RoomDto
  playerState: PlayerState | null
}

export const PlayersList: React.FC<PlayersListProps> = ({ roomData, playerState }) => {
  return (
    <Card className="backdrop-blur-sm bg-white/90">
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {roomData.players.map((player: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">{player.name || player.userName}</span>
                {(player.name === playerState?.name || player.userName === playerState?.name) && (
                  <Badge variant="secondary">You</Badge>
                )}
              </div>
              {(player.isHost || player.userId === roomData.hostUserId) && (
                <Badge variant="default" className="bg-yellow-500">
                  <Crown className="w-3 h-3 mr-1" />
                  Host
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}