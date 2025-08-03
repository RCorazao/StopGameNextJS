"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoomDto, PlayerState, VoteAnswerDto, AnswerDto, VoteDto, VoteRequest } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RoomVotingProps {
  roomData: RoomDto
  playerState: PlayerState | null
  onError: (error: string) => void
}

export const RoomVoting: React.FC<RoomVotingProps> = ({ roomData, playerState, onError }) => {
  const { connection, isConnected, requestVoteData, submitVotes, vote, finishVotingPhase } = useSignalR()
  const [voteAnswers, setVoteAnswers] = useState<VoteAnswerDto[]>([])
  const [votedAnswers, setVotedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('room: ', roomData);

  // Set up SignalR event listeners for VoteStarted and VoteUpdate
  useEffect(() => {
    if (!connection || !isConnected) return
    
    const handleVoteData = (voteAnswersList: VoteAnswerDto[]) => {
      console.log('Vote data received:', voteAnswersList)
      console.log('Number of vote answers received:', voteAnswersList?.length || 0)
      setVoteAnswers(voteAnswersList || [])
    }
    
    // Listen for room updates to detect state changes
    const handleRoomUpdated = (room: RoomDto) => {
      console.log('Room updated in voting component:', room.state)
      // No need to update state here as the parent component will handle it
    }
    
    // Add event listeners
    connection.on('VoteStarted', handleVoteData)
    connection.on('VoteUpdate', handleVoteData)
    connection.on('RoomUpdated', handleRoomUpdated)
    
    // Cleanup event listeners
    return () => {
      connection.off('VoteStarted', handleVoteData)
      connection.off('VoteUpdate', handleVoteData)
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
      
      // fetchVoteData()
    }
  }, [voteAnswers.length, requestVoteData, onError])

  const handleVote = async (answerId: string, isValid: boolean) => {
    setIsSubmitting(true)
    try {
      const voteRequest: VoteRequest = {
        answerId,
        isValid
      }
      await vote(voteRequest)
      console.log('Vote submitted:', voteRequest)
    } catch (error) {
      console.error('Failed to submit vote:', error)
      onError('Failed to submit vote')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleFinishVotingPhase = async () => {
    if (!playerState?.isHost) return
    
    setIsSubmitting(true)
    try {
      await finishVotingPhase()
      console.log('Voting phase finished')
    } catch (error) {
      console.error('Failed to finish voting phase:', error)
      onError('Failed to finish voting phase')
    } finally {
      setIsSubmitting(false)
    }
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
  
  // Helper function to check if the current player has voted for an answer
  const hasVotedFor = (answer: AnswerDto): boolean => {
    return votedAnswers[answer.topicId] === answer.id
  }
  
  // Helper function to get vote count for an answer
  const getVoteCount = (answer: AnswerDto): number => {
    return answer.votes?.length || 0
  }

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
              <div key={topicId} className="space-y-4">
                <h3 className="text-lg font-medium">
                  {topic?.name || 'Unknown Topic'}
                  <Badge variant="outline" className="ml-2">
                    Letter: {roomData.currentRound?.letter || '?'}
                  </Badge>
                </h3>
                
                <div className="space-y-3">
                  {answers.map(answer => {
                    const isVoted = hasVotedFor(answer);
                    const voteCount = getVoteCount(answer);
                    
                    return (
                      <div key={answer.id} className="border rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-lg">{answer.value}</div>
                            <div className="text-sm text-muted-foreground">By: {answer.playerName}</div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="bg-green-100 text-green-800 hover:bg-green-200"
                                    onClick={() => handleVote(answer.id, true)}
                                    disabled={isSubmitting}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Like this answer</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="bg-red-100 text-red-800 hover:bg-red-200"
                                    onClick={() => handleVote(answer.id, false)}
                                    disabled={isSubmitting}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Dislike this answer</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        {answer.votes && answer.votes.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium mb-1">Votes:</h4>
                            <div className="flex flex-wrap gap-1">
                              {answer.votes.map((vote, index) => (
                                <Badge 
                                  key={index} 
                                  variant={vote.isValid ? "default" : "outline"}
                                  className={vote.isValid ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}
                                >
                                  {vote.voterName}
                                  {vote.isValid ? 
                                    <ThumbsUp className="h-3 w-3 ml-1" /> : 
                                    <ThumbsDown className="h-3 w-3 ml-1" />}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      {playerState?.isHost && (
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button 
            onClick={handleFinishVotingPhase} 
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finish Voting Phase
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}