"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoomDto, PlayerState, VoteAnswerDto, AnswerDto } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'

interface RoomVotingProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoomVoting: React.FC<RoomVotingProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected, requestVoteData, submitVotes } = useSignalR()
  const [voteAnswers, setVoteAnswers] = useState<VoteAnswerDto[]>([])
  const [votedAnswers, setVotedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set up SignalR event listeners for VoteStarted
  useEffect(() => {
    if (!connection || !isConnected) return
    
    const handleVoteStarted = (voteAnswersList: VoteAnswerDto[]) => {
      console.log('Vote started with answers:', voteAnswersList)
      console.log('Number of vote answers received:', voteAnswersList?.length || 0)
      setVoteAnswers(voteAnswersList || [])
    }
    
    // Listen for room updates to detect state changes
    const handleRoomUpdated = (room: RoomDto) => {
      console.log('Room updated in voting component:', room.state)
      // No need to update state here as the parent component will handle it
    }
    
    // Add event listeners
    connection.on('VoteStarted', handleVoteStarted)
    connection.on('RoomUpdated', handleRoomUpdated)
    
    // Cleanup event listeners
    return () => {
      connection.off('VoteStarted', handleVoteStarted)
      connection.off('RoomUpdated', handleRoomUpdated)
    }
  }, [connection, isConnected])
  
  // Effect to request vote data if we don't have it yet
  useEffect(() => {
    if (voteAnswers.length === 0) {
      console.log('No vote answers, requesting vote data')
      const fetchVoteData = async () => {
        try {
          const voteData = await requestVoteData()
          if (voteData && voteData.length > 0) {
            console.log('Successfully retrieved vote data:', voteData)
            setVoteAnswers(voteData)
          } else {
            console.warn('No vote data available')
          }
        } catch (error) {
          console.error('Failed to fetch vote data:', error)
          onError('Failed to load voting data')
        }
      }
      
      fetchVoteData()
    }
  }, [voteAnswers.length, requestVoteData, onError])

  const handleVote = (topicId: string, answerId: string) => {
    setVotedAnswers(prev => ({
      ...prev,
      [topicId]: answerId
    }))
  }

  const isAllTopicsVoted = () => {
    if (!voteAnswers.length) return false
    
    // Get unique topic IDs from vote answers
    const topicIds = [...new Set(voteAnswers.map(answer => answer.topicId))]
    
    // Check if all topics have been voted on
    return topicIds.every(topicId => votedAnswers[topicId])
  }

  const handleSubmitVotes = async () => {
    if (!connection || !isConnected) return

    setIsSubmitting(true)
    try {
      await submitVotes(votedAnswers)
      console.log('Votes submitted:', votedAnswers)
    } catch (error) {
      console.error('Failed to submit votes:', error)
      onError('Failed to submit votes')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group answers by topic
  const answersByTopic: Record<string, AnswerDto[]> = {}
  voteAnswers.forEach(voteAnswer => {
    if (!answersByTopic[voteAnswer.topicId]) {
      answersByTopic[voteAnswer.topicId] = []
    }
    // Add all answers for this topic to the map
    voteAnswer.answers.forEach(answer => {
      answersByTopic[voteAnswer.topicId].push(answer)
    })
  })

  if (voteAnswers.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/80">
        <CardContent className="pt-6">
          <div className="text-center">
            <p>Loading voting data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80">
      <CardHeader>
        <CardTitle>Vote for the best answers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(answersByTopic).map(([topicId, answers]) => {
            const topic = roomData.topics.find(t => t.id === topicId)
            
            return (
              <div key={topicId} className="space-y-2">
                <h3 className="text-lg font-medium">
                  {topic?.name || 'Unknown Topic'}
                  {/* {topic?.category && (
                    <Badge variant="outline" className="ml-2">
                      {topic.category}
                    </Badge>
                  )} */}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {answers.map(answer => (
                    <Button
                      key={answer.id}
                      variant={votedAnswers[topicId] === answer.id ? "default" : "outline"}
                      className="justify-start h-auto py-2 px-4 text-left"
                      onClick={() => handleVote(topicId, answer.id)}
                      disabled={isSubmitting}
                    >
                      <div>
                        <div className="font-medium">{answer.value}</div>
                        <div className="text-sm text-muted-foreground">{answer.playerName}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}

          <Button 
            onClick={handleSubmitVotes} 
            className="w-full mt-4"
            disabled={!isAllTopicsVoted() || isSubmitting}
          >
            Submit Votes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}