"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Send } from 'lucide-react'
import { RoomDto, PlayerState, SubmitAnswersRequest, VoteAnswerDto, RoomState } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'

interface RoomPlayingProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoomPlaying: React.FC<RoomPlayingProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected, stopRound, submitAnswers } = useSignalR()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const answersRef = useRef(answers)
  answersRef.current = answers
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const currentRound = roomData.currentRound

  // Update timer
  useEffect(() => {
    if (!currentRound || !currentRound.isActive) return

    setTimeRemaining(currentRound.timeRemainingSeconds)

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentRound])

  // Set up SignalR event listeners for RoundStopped
  useEffect(() => {
    if (!connection || !isConnected) return

    const handleRoundStopped = async (room: RoomDto) => {
      console.log('Round stopped, submitting answers:', answersRef.current)
      setIsSubmitting(false)
      try {
        const request: SubmitAnswersRequest = {
          answers: answersRef.current,
        }

        await submitAnswers(request)
      } catch (error) {
        console.error('Failed to submit answers after round stopped:', error)
        onError('Failed to submit answers')
      }
    }

    // Listen for room updates to detect state changes
    const handleRoomUpdated = (room: RoomDto) => {
      console.log('Room updated in playing component:', room.state)
      // No need to update state here as the parent component will handle it
    }

    // Add event listeners
    connection.on('RoundStopped', handleRoundStopped)
    connection.on('RoomUpdated', handleRoomUpdated)

    // Cleanup event listeners
    return () => {
      connection.off('RoundStopped', handleRoundStopped)
      connection.off('RoomUpdated', handleRoomUpdated)
    }
  }, [connection, isConnected, submitAnswers, onError])

  const handleAnswerChange = (topicId: string, value: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [topicId]: value }
      answersRef.current = updated
      return updated
    })
  }

  const handleStopRound = async () => {
    if (!playerState?.isHost) return
    
    try {
      await stopRound()
    } catch (error) {
      console.error('Failed to stop round:', error)
      onError('Failed to stop round')
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const getTimeColor = (seconds: number): string => {
    if (seconds <= 10) return 'text-red-500'
    if (seconds <= 30) return 'text-orange-500'
    return 'text-green-500'
  }

  if (!currentRound) {
    return <div>No active round</div>
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Round {roomData.rounds.length}: {currentRound.letter}</span>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-1" />
            <span className={getTimeColor(timeRemaining)}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roomData.topics.map(topic => (
            <div key={topic.id} className="space-y-2">
              <Label htmlFor={topic.id}>
                {topic.name}
                {/* {topic.category && (
                  <Badge variant="outline" className="ml-2">
                    {topic.category}
                  </Badge>
                )} */}
              </Label>
              <Input
                id={topic.id}
                value={answers[topic.id] || ''}
                onChange={(e) => handleAnswerChange(topic.id, e.target.value)}
                placeholder={`${currentRound.letter}...`}
                disabled={timeRemaining === 0 || isSubmitting}
              />
            </div>
          ))}

          {playerState?.isHost && (
            <Button 
              onClick={handleStopRound} 
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              Stop Round
            </Button>
          )}

          {timeRemaining === 0 && !playerState?.isHost && (
            <div className="text-center mt-4">
              <p>Time's up! Waiting for host to end the round...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}