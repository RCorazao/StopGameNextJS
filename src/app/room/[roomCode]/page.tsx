"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSignalR } from '@/contexts/SignalRContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConnectionStatus from '@/components/ConnectionStatus'
import { Users, Crown, ArrowLeft } from 'lucide-react'
import { RoomDto } from '@/types/signalr'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { connection, isConnected, playerState, leaveRoom, setPlayerState } = useSignalR()
  
  const roomCode = params.roomCode as string

  
  const [roomData, setRoomData] = useState<RoomDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect to home if no player state is available
  useEffect(() => {
    if (!playerState) {
      router.push('/')
      return
    }
  }, [playerState, router])

  useEffect(() => {
    if (!connection || !isConnected) return

    // Set up SignalR event listeners
    const handleRoomCreated = (room: RoomDto) => {
      console.log('Room created, received room:', room)
      setRoomData(room)
      setIsLoading(false)
      setError('')
    }

    const handleRoomJoined = (room: RoomDto) => {
      console.log('Room joined, received room:', room)
      setRoomData(room)
      setIsLoading(false)
      setError('')
    }

    const handlePlayerJoined = (player: any) => {
      console.log('Player joined:', player)
      setRoomData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          players: [...prev.players, player]
        }
      })
    }

    const handlePlayerLeft = (playerName: string) => {
      console.log('Player left:', playerName)
      setRoomData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          players: prev.players.filter((p: any) => p.name !== playerName)
        }
      })
    }

    const handleError = (errorMessage: string) => {
      console.error('Room error:', errorMessage)
      setError(errorMessage)
      setIsLoading(false)
    }

    const handleRoomUpdated = (updatedRoom: RoomDto) => {
      console.log('Room updated:', updatedRoom)
      setRoomData(updatedRoom)
    }

    // Register event listeners
    connection.on('RoomCreated', handleRoomCreated)
    connection.on('RoomJoined', handleRoomJoined)
    connection.on('PlayerJoined', handlePlayerJoined)
    connection.on('PlayerLeft', handlePlayerLeft)
    connection.on('Error', handleError)
    connection.on('RoomUpdated', handleRoomUpdated)

    // Try to rejoin the room (in case of page refresh)
    const rejoinRoom = async () => {
      try {
        // Use connection ID to get the room the client is currently in
        await connection.invoke('GetCurrentRoom')
      } catch (error) {
        console.error('Failed to get current room:', error)
        setError('Failed to connect to room. Please try again.')
        setIsLoading(false)
      }
    }

    rejoinRoom()

    // Cleanup event listeners
    return () => {
      connection.off('RoomCreated', handleRoomCreated)
      connection.off('RoomJoined', handleRoomJoined)
      connection.off('PlayerJoined', handlePlayerJoined)
      connection.off('PlayerLeft', handlePlayerLeft)
      connection.off('Error', handleError)
      connection.off('RoomUpdated', handleRoomUpdated)
    }
  }, [connection, isConnected, roomCode, playerState])

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom()
      router.push('/')
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  const handleStartGame = async () => {
    if (!connection || !isConnected || !playerState?.isHost) return
    
    try {
      await connection.invoke('StartGame', roomCode)
    } catch (error) {
      console.error('Failed to start game:', error)
      setError('Failed to start game. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p>Connecting to room...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-red-500 text-lg font-semibold">Error</div>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Room not found</p>
            <Button onClick={() => router.push('/')} className="w-full mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <ConnectionStatus />
        
        {/* Room Header */}
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

        {/* Players List */}
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

        {/* Game Controls */}
        {roomData.state === 'waiting' && (
          <Card className="backdrop-blur-sm bg-white/90">
            <CardContent className="p-6">
              <div className="space-y-4">
                {playerState?.isHost ? (
                  <>
                    <p className="text-center text-gray-600">
                      You are the host. Start the game when ready!
                    </p>
                    <Button 
                      onClick={handleStartGame} 
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled={roomData.players.length < 2}
                    >
                      Start Game
                    </Button>
                    {roomData.players.length < 2 && (
                      <p className="text-sm text-gray-500 text-center">
                        Need at least 2 players to start
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-center text-gray-600">
                    Waiting for the host to start the game...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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