"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSignalR } from '@/contexts/SignalRContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ConnectionStatus from '@/components/ConnectionStatus'
import { ArrowLeft } from 'lucide-react'
import { useRoom } from '@/hooks/useRoom'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { RoomHeader } from '@/components/room/RoomHeader'
import { GameControls } from '@/components/room/GameControls'
import { RoomState } from '@/types/signalr'

// Import state-specific components
import { RoomWaiting } from '@/components/room/RoomWaiting'
import { RoomPlaying } from '@/components/room/RoomPlaying'
import { RoomVoting } from '@/components/room/RoomVoting'
import { RoomResults } from '@/components/room/RoomResults'
import { RoomFinished } from '@/components/room/RoomFinished'

export default function RoomPage() {
  const router = useRouter()
  const { playerState, leaveRoom } = useSignalR()
  const roomCode = playerState?.roomCode;
  const { roomData, isLoading, error, setError } = useRoom(roomCode)

  // Redirect to home if no player state is available
  useEffect(() => {
    if (!playerState) {
      router.push('/')
      return
    }
  }, [playerState, router])

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom()
      router.push('/')
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Connecting to room..." />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  if (!roomData) {
    return <ErrorDisplay error="Room not found" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <ConnectionStatus />
        
        <RoomHeader roomData={roomData} />
        
        {/* Render the appropriate component based on room state */}
        {(() => {
          switch (roomData.state) {
            case RoomState.Waiting:
              return (
                <>
                  <RoomWaiting 
                    roomData={roomData} 
                    playerState={playerState} 
                    onError={setError}
                  />
                  <GameControls 
                    roomData={roomData} 
                    playerState={playerState} 
                    onError={setError}
                  />
                </>
              )
            case RoomState.Playing:
              return (
                <RoomPlaying 
                  roomData={roomData} 
                  playerState={playerState} 
                  onError={setError}
                />
              )
            case RoomState.Voting:
              return (
                <RoomVoting 
                  roomData={roomData} 
                  playerState={playerState} 
                  onError={setError}
                />
              )
            case RoomState.Results:
              return (
                <RoomResults 
                  roomData={roomData} 
                  playerState={playerState} 
                  onError={setError}
                />
              )
            case RoomState.Finished:
              return (
                <RoomFinished 
                  roomData={roomData} 
                  playerState={playerState} 
                  onError={setError}
                />
              )
            default:
              return (
                <ErrorDisplay error={`Unknown room state: ${roomData.state}`} />
              )
          }
        })()}

        {/* Leave Room */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardContent className="p-4">
            <Button 
              onClick={handleLeaveRoom} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}