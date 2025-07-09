"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Send } from 'lucide-react'
import { RoomDto, PlayerState, RoundDto, AnswerDto } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'

interface RoundPlayProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoundPlay: React.FC<RoundPlayProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected } = useSignalR()
  const [answers, setAnswers] = useState<Record<string, string>>({})
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

  const handleAnswerChange = (topicName: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [topicName]: value
    }))
  }

  const handleSubmitAnswers = async () => {
    if (!connection || !isConnected || !currentRound) return

    setIsSubmitting(true)
    try {
      const submissionAnswers: AnswerDto[] = Object.entries(answers)
        .filter(([_, answer]) => answer.trim() !== '')
        .map(([topicName, word]) => ({
          word: word.trim(),
          topicName
        }))

      await connection.invoke('SubmitAnswers', roomData.code, submissionAnswers)
      console.log('Answers submitted successfully')
    } catch (error) {
      console.error('Failed to submit answers:', error)
      onError('Failed to submit answers. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                value={answers[topic.name] || ''}
                onChange={(e) => handleAnswerChange(topic.name, e.target.value)}
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