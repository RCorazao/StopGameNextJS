export type Language = 'en' | 'es'

export interface Translations {
  // Header
  title: string
  subtitle: string
  
  // Main card
  readyToPlay: string
  enterNameAndRoom: string
  yourName: string
  enterYourName: string
  createRoom: string
  joinRoom: string
  
  // Android app section
  getAndroidApp: string
  downloadApkDescription: string
  installNote: string
  installNoteText: string
  downloadApk: string
  comingSoonPlayStore: string
  
  // Game rules
  howToPlay: string
  rule1: string
  rule2: string
  rule3: string
  rule4: string
  
  // Connection status
  connected: string
  disconnected: string
  connecting: string
  
  // Language selector
  language: string
  english: string
  spanish: string
  
  // Chat
  chat: string
  noMessagesYet: string
  typeMessage: string
  send: string
  
  // Room dialogs
  createNewRoom: string
  createRoomDescription: string
  roomCodeGenerated: string
  creating: string
  joining: string
  joinRoomDescription: string
  roomCode: string
  enterRoomCode: string
  
  // Game controls
  youAreHost: string
  startFirstRound: string
  readyNextRound: string
  startRound: string
  needTwoPlayers: string
  waitingHostStart: string
  waitingHostNextRound: string
  
  // Players list
  players: string
  you: string
  host: string
  
  // Room header
  room: string
  waitingForPlayers: string
  gameInProgress: string
  votingPhase: string
  gameFinished: string
  round: string
  letter: string
  
  // Room playing
  fillAllTopics: string
  mustStartWith: string
  stopRound: string
  
  // Room results
  roundResults: string
  scores: string
  startNextRound: string
  
  // Room settings
  roomSettings: string
  edit: string
  maxPlayers: string
  maxRounds: string
  roundDuration: string
  votingDuration: string
  topics: string
  addCustomTopic: string
  save: string
  saving: string
  cancel: string
  customTopics: string
  
  // Room voting
  voteBestAnswers: string
  unknownTopic: string
  by: string
  likeAnswer: string
  dislikeAnswer: string
  votes: string
  finishVotingPhase: string
  loadingVotingData: string
  
  // Room finished
  winner: string
  points: string
  finalScores: string
  leaveRoom: string
  
  // Time formatting
  timeRemaining: string
}