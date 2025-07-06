// SignalR related type definitions
import { HubConnection } from '@microsoft/signalr'

export interface CreateRoomRequest {
  hostName: string
  customTopics: string[]
  useDefaultTopics: boolean
  maxPlayers: number
  roundDurationSeconds: number
  votingDurationSeconds: number
  maxRounds: number
}

export interface JoinRoomRequest {
  roomCode: string
  playerName: string
}

export interface RoomDto {
  id: string
  code: string
  hostUserId: string
  topics: TopicDto[]
  players: PlayerDto[]
  state: string
  rounds: RoundDto[]
  createdAt: string
  expiresAt?: string
  maxPlayers: number
  roundDurationSeconds: number
  votingDurationSeconds: number
  maxRounds: number
  currentRound?: RoundDto
}

export interface PlayerDto {
  id: string
  connectionId: string
  name: string
  score: number
  isConnected: boolean
  joinedAt: string
  isHost: boolean
}

export interface TopicDto {
  id: string
  name: string
  idDefault: boolean
  createdByUserId: string
  createdAt: string
}

export interface RoundDto {
  id: string
  letter: string
  StartedAt: string
  EndedAt: string
  Submissions: SubmissionDto[]
  Votes: VoteDto[]
  IsActive: boolean
  TimeRemainingSeconds: number
}

export interface SubmissionDto {
  id: string
  playerName: string
  topicName: string
  answer: AnswerDto
  SubmittedAt: string
  IsValid: boolean
  VotesValid: number
  VotesInvalid: number
}

export interface VoteDto {
  voterId: string
  voterName: string
  answerOwnerId: string
  answerOwnerName: string
  topicName: string
  isValid: boolean
  createdAt: string
}

export interface AnswerDto {
  word: string
  topicName: string
}

export interface PlayerState {
  name: string
  isHost: boolean
  roomCode?: string
}

export interface SignalRContextType {
  connection: HubConnection | null
  connectionState: string
  isConnected: boolean
  playerState: PlayerState | null
  setPlayerState: (state: PlayerState | null) => void
  createRoom: (hostName: string, options?: Partial<CreateRoomRequest>) => Promise<RoomDto | null>
  joinRoom: (roomCode: string, playerName: string) => Promise<RoomDto | null>
  leaveRoom: () => Promise<void>
}