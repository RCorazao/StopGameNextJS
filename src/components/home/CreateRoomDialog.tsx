"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useSignalR } from '@/contexts/SignalRContext'
import { useRouter } from 'next/navigation'

interface CreateRoomDialogProps {
  playerName: string
  isConnected: boolean
}

export const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ playerName, isConnected }) => {
  const [showDialog, setShowDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const { createRoom, setPlayerState } = useSignalR()
  const router = useRouter()

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return
    
    setIsCreating(true)
    setError('')
    
    try {
      const result = await createRoom(playerName.trim())
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
        setError('Failed to create room. Please try again.')
      }
    } catch (error) {
      console.error('Error creating room:', error)
      setError(error instanceof Error ? error.message : 'Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          className="h-16 flex-col gap-2 bg-green-500 hover:bg-green-600" 
          disabled={!playerName.trim() || !isConnected}
        >
          <Plus className="w-6 h-6" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>You'll be the host and can choose topics for the game</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Room code will be generated automatically</p>
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button 
            onClick={handleCreateRoom} 
            className="w-full" 
            disabled={isCreating || !isConnected}
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}