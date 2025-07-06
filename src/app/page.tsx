"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Hash, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSignalR } from "@/contexts/SignalRContext"
import ConnectionStatus from "@/components/ConnectionStatus"

export default function HomePage() {
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { createRoom, joinRoom, isConnected, setPlayerState } = useSignalR()

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return
    
    setIsCreating(true)
    setError("")
    
    try {
      const room = await createRoom(playerName.trim())
      if (room) {
        // Set player state in context
        setPlayerState({
          name: playerName.trim(),
          isHost: true,
          roomCode: room.code
        })
        setShowCreateDialog(false)
        router.push(`/room/${room.code}`)
      } else {
        setError("Failed to create room. Please try again.")
      }
    } catch (error) {
      console.error('Error creating room:', error)
      setError(error instanceof Error ? error.message : "Failed to create room. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return
    
    setIsJoining(true)
    setError("")
    
    try {
      const room = await joinRoom(roomCode.trim(), playerName.trim())
      if (room) {
        // Set player state in context
        setPlayerState({
          name: playerName.trim(),
          isHost: false,
          roomCode: room.code
        })
        setShowJoinDialog(false)
        router.push(`/room/${room.code}`)
      } else {
        setError("Failed to join room. Please check the room code and try again.")
      }
    } catch (error) {
      console.error('Error joining room:', error)
      setError("Failed to join room. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Connection Status */}
        <ConnectionStatus />
        
        {/* Header */}
        <div className="text-center text-white space-y-2">
          <h1 className="text-4xl font-bold">Stop Game</h1>
          <p className="text-lg opacity-90">Tutti Frutti Multiplayer</p>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Play className="w-6 h-6" />
              Ready to Play?
            </CardTitle>
            <CardDescription>Enter your name and create or join a room</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Your Name</Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Room'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2 bg-transparent"
                    disabled={!playerName.trim() || !isConnected}
                  >
                    <Hash className="w-6 h-6" />
                    Join Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Room</DialogTitle>
                    <DialogDescription>Enter the room code shared by the host</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roomCode">Room Code</Label>
                      <Input
                        id="roomCode"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="text-center text-lg font-mono"
                        disabled={isJoining}
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
                      disabled={isJoining || !isConnected || !roomCode.trim()}
                    >
                      {isJoining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Joining...
                        </>
                      ) : (
                        'Join Room'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Each round starts with a random letter</p>
            <p>• Fill words for each topic starting with that letter</p>
            <p>• Vote on other players' answers</p>
            <p>• Score points for unique and valid answers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

