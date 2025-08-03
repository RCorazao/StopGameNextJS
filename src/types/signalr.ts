// SignalR related type definitions
import { HubConnection } from '@microsoft/signalr'

export interface CreateRoomRequest {
  hostName: string
  customTopics?: string[]
  useDefaultTopics?: boolean
  maxPlayers?: number
  roundDurationSeconds?: number
  votingDurationSeconds?: number
  maxRounds?: number
}

export interface JoinRoomRequest {
  roomCode: string
  playerName: string
}

export interface UpdateRoomSettingsRequest {
  topics: string[]
  maxPlayers?: number
  roundDurationSeconds?: number
  votingDurationSeconds?: number
  maxRounds?: number
}

export interface SubmitAnswersRequest {
  answers: { [topicId: string]: string };
}

export interface RoomDto {
  id: string
  code: string
  hostUserId: string
  topics: TopicDto[]
  players: PlayerDto[]
  state: RoomState
  rounds: RoundDto[]
  createdAt: string
  expiresAt?: string
  maxPlayers: number
  roundDurationSeconds: number
  votingDurationSeconds: number
  maxRounds: number
  currentRound?: RoundDto
}

export enum RoomState {
  Waiting = 0,
  Playing = 1,
  Voting = 2,
  Results = 3,
  Finished = 4
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
  startedAt: string
  endedAt: string
  answers: AnswerDto[]
  isActive: boolean
  timeRemainingSeconds: number
}

export interface VoteDto {
  voterId: string
  voterName: string
  answerOwnerId: string
  answerOwnerName: string
  topicId: string
  topicName: string
  isValid: boolean
  createdAt: string
}

export interface AnswerDto {
  id: string
  topicId: string
  playerId: string
  playerName: string
  topicName: string
  value: string
  createdAt: string
  votes: VoteDto[]
}

export interface VoteAnswerDto {
  topicId: string
  topicName: string
  answers: AnswerDto[]
}

export interface PlayerState {
  id: string
  name: string
  isHost: boolean
  score: number | 0
  roomCode?: string
}

export interface SignalRContextType {
  connection: HubConnection | null
  connectionState: string
  isConnected: boolean
  playerState: PlayerState | null
  setPlayerState: (state: PlayerState | null) => void
  createRoom: (hostName: string, options?: Partial<CreateRoomRequest>) => Promise<{ room: RoomDto; player: PlayerDto } | null>
  joinRoom: (roomCode: string, playerName: string) => Promise<{ room: RoomDto; player: PlayerDto } | null>
  leaveRoom: () => Promise<void>
  updateRoomSettings: (roomCode: string, settings: Partial<CreateRoomRequest>) => Promise<void>
  startRound: () => Promise<void>
  stopRound: () => Promise<void>
  submitAnswers: (request: SubmitAnswersRequest) => Promise<void>
  requestVoteData: () => Promise<VoteAnswerDto[] | null>
  submitVotes: (votes: Record<string, string>) => Promise<void>
}