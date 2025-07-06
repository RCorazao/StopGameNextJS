"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Hash } from 'lucide-react'
import { useSignalR } from '@/contexts/SignalRContext'
import { useRouter } from 'next/navigation'

interface JoinRoomDialogProps {
  playerName: string
  isConnected: boolean
}

export const JoinRoomDialog: React.FC<JoinRoomDialogProps> = ({ playerName, isConnected }) => {
  const [showDialog, setShowDialog] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const { joinRoom, setPlayerState } = useSignalR()
  const router = useRouter()

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return
    
    setIsJoining(true)
    setError('')
    
    try {
      const result = await joinRoom(roomCode.trim(), playerName.trim())
      if (result) {
        const { room, player } = result;
        // Set player state in context
        setPlayerState({
          id: player.id,
          name: player.name,
          isHost: player.isHost,
          score: player.score,
          roomCode: room.code
        })
        setShowDialog(false)
        router.push(`/room/${room.code}`)
      } else {
        setError('Failed to join room. Please check the room code and try again.')
      }
    } catch (error) {
      console.error('Error joining room:', error)
      setError('Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          className="h-16 flex-col gap-2 bg-blue-500 hover:bg-blue-600" 
          disabled={!playerName.trim() || !isConnected}
        >
          <Hash className="w-6 h-6" />
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
          <DialogDescription>Enter the room code to join an existing game</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg"
              maxLength={6}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button 
            onClick={handleJoinRoom} 
            className="w-full" 
            disabled={isJoining || !roomCode.trim() || !isConnected}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}