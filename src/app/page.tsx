"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play } from "lucide-react"
import { useSignalR } from "@/contexts/SignalRContext"
import ConnectionStatus from "@/components/ConnectionStatus"
import { CreateRoomDialog } from "@/components/home/CreateRoomDialog"
import { JoinRoomDialog } from "@/components/home/JoinRoomDialog"

export default function HomePage() {
  const [playerName, setPlayerName] = useState("")
  const { isConnected } = useSignalR()

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
              <CreateRoomDialog 
                playerName={playerName} 
                isConnected={isConnected} 
              />
              
              <JoinRoomDialog 
                playerName={playerName} 
                isConnected={isConnected} 
              />
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

