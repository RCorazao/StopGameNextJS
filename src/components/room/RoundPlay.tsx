"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Send } from 'lucide-react'
import { RoomDto, PlayerState, SubmitAnswersRequest, VoteAnswerDto } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'

interface RoundPlayProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoundPlay: React.FC<RoundPlayProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected, stopRound, submitAnswers } = useSignalR()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const answersRef = useRef(answers)
  answersRef.current = answers
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [voteAnswers, setVoteAnswers] = useState<VoteAnswerDto[]>([])

  const currentRound = roomData.currentRound

  // Update timer
  useEffect(() => {
    if (voteAnswers.length > 0) {
      setTimeRemaining(0)
      return
    }

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
  }, [currentRound, voteAnswers])

  // Set up SignalR event listeners
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

    const handleVoteStarted = (voteAnswersList: VoteAnswerDto[]) => {
      console.log('Vote started with answers:', voteAnswersList)
      console.log('Room state should be Voting:', roomData.state)
      setVoteAnswers(voteAnswersList || [])
    }

    // Add event listeners
    connection.on('RoundStopped', handleRoundStopped)
    connection.on('VoteStarted', handleVoteStarted)

    // Cleanup event listeners
    return () => {
      connection.off('RoundStopped', handleRoundStopped)
      connection.off('VoteStarted', handleVoteStarted)
    }
  }, [connection, isConnected, roomData, submitAnswers, onError])

  const handleAnswerChange = (topicId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [topicId]: value
    }))
  }

  const handleSubmitAnswers = async () => {
    if (!connection || !isConnected || !currentRound) return

    setIsSubmitting(true)
    try {
      await stopRound()
      console.log('Round stop initiated successfully')
    } catch (error) {
      console.error('Failed to stop round:', error)
      onError('Failed to stop round. Please try again.')
      setIsSubmitting(false)
    }
    // Note: setIsSubmitting(false) will be called when RoundStopped event is received
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining > 30) return 'text-green-600'
    if (timeRemaining > 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Show voting phase if we have vote answers
  if (voteAnswers.length > 0) {
    console.log('Rendering voting phase UI')
    return (
      <Card className="backdrop-blur-sm bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Voting Phase - Round {roomData.rounds.length}</span>
              <Badge variant="outline" className="text-lg font-bold">
                Letter: {currentRound?.letter.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 text-center">
            Review all answers and vote on their validity
          </div>
          
          <div className="space-y-6">
            {voteAnswers.map((voteAnswer, topicIndex) => (
              <div key={topicIndex} className="space-y-2">
                <Label className="text-lg font-semibold">{voteAnswer.topicName}</Label>
                <div className="grid gap-2">
                  {voteAnswer.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <span className="font-medium">{answer.value}</span>
                        <span className="text-sm text-gray-500 ml-2">by {answer.playerName}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                          Valid
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                          Invalid
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentRound) {
    return null
  }

  return (
    <Card className="backdrop-blur-sm bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Round {roomData.rounds.length}</span>
            <Badge variant="outline" className="text-lg font-bold">
              Letter: {currentRound.letter.toUpperCase()}
            </Badge>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg ${getTimeColor()}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 text-center">
          Fill in words that start with <strong>{currentRound.letter.toUpperCase()}</strong> for each topic
        </div>
        
        <div className="space-y-3">
          {roomData.topics.map((topic, index) => (
            <div key={index} className="space-y-1">
              <Label htmlFor={`topic-${index}`} className="text-sm font-medium">
                {topic.name}
              </Label>
              <Input
                id={`topic-${index}`}
                placeholder={`Word starting with ${currentRound.letter.toUpperCase()}...`}
                value={answers[topic.id] || ''}
                onChange={(e) => handleAnswerChange(topic.id, e.target.value)}
                disabled={!currentRound.isActive || timeRemaining === 0}
                className="text-center"
              />
            </div>
          ))}
        </div>

        {currentRound.isActive && timeRemaining > 0 && (
          <Button 
            onClick={handleSubmitAnswers}
            disabled={isSubmitting || Object.keys(answers).length === 0}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </Button>
        )}

        {(!currentRound.isActive || timeRemaining === 0) && (
          <div className="text-center text-gray-600">
            {timeRemaining === 0 ? 'Time\'s up!' : 'Round ended'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}