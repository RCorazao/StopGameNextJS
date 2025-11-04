import { Translations, Language } from '@/types/language'

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: 'Stop Game',
    subtitle: 'Tutti Frutti Multiplayer',

    // Main card
    readyToPlay: 'Ready to Play?',
    enterNameAndRoom: 'Enter your name and create or join a room',
    yourName: 'Your Name',
    enterYourName: 'Enter your name',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',

    // Android app section
    getAndroidApp: '📱 Get the Android App',
    downloadApkDescription: 'Download from Google Play Store',
    installNote: 'Note:',
    installNoteText: 'Enable "Install from unknown sources" in your Android settings before installing.',
    downloadApk: 'Get on Google Play',
    comingSoonPlayStore: 'Available now on Google Play Store',

    // Game rules
    howToPlay: 'How to Play',
    rule1: '• Each round starts with a random letter',
    rule2: '• Fill words for each topic starting with that letter',
    rule3: '• Vote on other players\' answers',
    rule4: '• Score points for unique and valid answers',

    // Connection status
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',

    // Language selector
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',

    // Chat
    chat: 'Chat',
    noMessagesYet: 'No messages yet.',
    typeMessage: 'Type a message...',
    send: 'Send',

    // Room dialogs
    createNewRoom: 'Create New Room',
    createRoomDescription: 'You\'ll be the host and can choose topics for the game',
    roomCodeGenerated: 'Room code will be generated automatically',
    creating: 'Creating...',
    joining: 'Joining...',
    joinRoomDescription: 'Enter the room code to join an existing game',
    roomCode: 'Room Code',
    enterRoomCode: 'Enter room code',

    // Game controls
    youAreHost: 'You are the host. Start the first round when ready!',
    startFirstRound: 'Start the first round when ready!',
    readyNextRound: 'Ready to start the next round?',
    startRound: 'Start Round',
    needTwoPlayers: 'Need at least 2 players to start',
    waitingHostStart: 'Waiting for the host to start the game...',
    waitingHostNextRound: 'Waiting for the host to start the next round...',

    // Players list
    players: 'Players',
    you: 'You',
    host: 'Host',

    // Room header
    room: 'Room',
    waitingForPlayers: 'Waiting for players',
    gameInProgress: 'Game in progress',
    votingPhase: 'Voting phase',
    gameFinished: 'Game finished',
    round: 'Round',
    letter: 'Letter',

    // Room playing
    fillAllTopics: 'Fill in all topics to submit',
    mustStartWith: 'All answers must start with',
    stopRound: 'Stop Round',

    // Room results
    roundResults: 'Round Results',
    scores: 'Scores',
    startNextRound: 'Start Next Round',

    // Room settings
    roomSettings: 'Room Settings',
    edit: 'Edit',
    maxPlayers: 'Max Players',
    maxRounds: 'Max Rounds',
    roundDuration: 'Round Duration',
    votingDuration: 'Voting Duration',
    topics: 'Topics',
    addCustomTopic: 'Add a custom topic...',
    save: 'Save Settings',
    saving: 'Saving...',
    cancel: 'Cancel',
    customTopics: 'Custom Topics',

    // Room voting
    voteBestAnswers: 'Vote for the best answers',
    unknownTopic: 'Unknown Topic',
    by: 'By',
    likeAnswer: 'Like this answer',
    dislikeAnswer: 'Dislike this answer',
    votes: 'Votes',
    finishVotingPhase: 'Finish Voting Phase',
    loadingVotingData: 'Loading voting data...',

    // Room finished
    winner: 'Winner',
    points: 'points',
    finalScores: 'Final Scores',
    leaveRoom: 'Leave Room',

    // Time formatting
    timeRemaining: 'Time Remaining'
  },
  es: {
    // Header
    title: 'Juego Stop',
    subtitle: 'Tutti Frutti Multijugador',

    // Main card
    readyToPlay: '¿Listo para Jugar?',
    enterNameAndRoom: 'Ingresa tu nombre y crea o únete a una sala',
    yourName: 'Tu Nombre',
    enterYourName: 'Ingresa tu nombre',
    createRoom: 'Crear Sala',
    joinRoom: 'Unirse a Sala',

    // Android app section
    getAndroidApp: '📱 Obtener la App de Android',
    downloadApkDescription: 'Descargar desde Google Play Store',
    installNote: 'Nota:',
    installNoteText: 'Habilita "Instalar desde fuentes desconocidas" en la configuración de Android antes de instalar.',
    downloadApk: 'Obtener en Google Play',
    comingSoonPlayStore: 'Disponible ahora en Google Play Store',

    // Game rules
    howToPlay: 'Cómo Jugar',
    rule1: '• Cada ronda comienza con una letra aleatoria',
    rule2: '• Completa palabras para cada tema que empiecen con esa letra',
    rule3: '• Vota las respuestas de otros jugadores',
    rule4: '• Gana puntos por respuestas únicas y válidas',

    // Connection status
    connected: 'Conectado',
    disconnected: 'Desconectado',
    connecting: 'Conectando...',

    // Language selector
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',

    // Chat
    chat: 'Chat',
    noMessagesYet: 'Aún no hay mensajes.',
    typeMessage: 'Escribe un mensaje...',
    send: 'Enviar',

    // Room dialogs
    createNewRoom: 'Crear Nueva Sala',
    createRoomDescription: 'Serás el anfitrión y podrás elegir los temas del juego',
    roomCodeGenerated: 'El código de sala se generará automáticamente',
    creating: 'Creando...',
    joining: 'Uniéndose...',
    joinRoomDescription: 'Ingresa el código de sala para unirte a un juego existente',
    roomCode: 'Código de Sala',
    enterRoomCode: 'Ingresa el código de sala',

    // Game controls
    youAreHost: 'Eres el anfitrión. ¡Inicia la primera ronda cuando estés listo!',
    startFirstRound: '¡Inicia la primera ronda cuando estés listo!',
    readyNextRound: '¿Listo para iniciar la siguiente ronda?',
    startRound: 'Iniciar Ronda',
    needTwoPlayers: 'Se necesitan al menos 2 jugadores para comenzar',
    waitingHostStart: 'Esperando a que el anfitrión inicie el juego...',
    waitingHostNextRound: 'Esperando a que el anfitrión inicie la siguiente ronda...',

    // Players list
    players: 'Jugadores',
    you: 'Tú',
    host: 'Anfitrión',

    // Room header
    room: 'Sala',
    waitingForPlayers: 'Esperando jugadores',
    gameInProgress: 'Juego en progreso',
    votingPhase: 'Fase de votación',
    gameFinished: 'Juego terminado',
    round: 'Ronda',
    letter: 'Letra',

    // Room playing
    fillAllTopics: 'Completa todos los temas para enviar',
    mustStartWith: 'Todas las respuestas deben empezar con',
    stopRound: 'Detener Ronda',

    // Room results
    roundResults: 'Resultados de la Ronda',
    scores: 'Puntuaciones',
    startNextRound: 'Iniciar Siguiente Ronda',

    // Room settings
    roomSettings: 'Configuración de Sala',
    edit: 'Editar',
    maxPlayers: 'Máx. Jugadores',
    maxRounds: 'Máx. Rondas',
    roundDuration: 'Duración de Ronda',
    votingDuration: 'Duración de Votación',
    topics: 'Temas',
    addCustomTopic: 'Agregar un tema personalizado...',
    save: 'Guardar Configuración',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    customTopics: 'Temas Personalizados',

    // Room voting
    voteBestAnswers: 'Vota por las mejores respuestas',
    unknownTopic: 'Tema Desconocido',
    by: 'Por',
    likeAnswer: 'Me gusta esta respuesta',
    dislikeAnswer: 'No me gusta esta respuesta',
    votes: 'Votos',
    finishVotingPhase: 'Finalizar Fase de Votación',
    loadingVotingData: 'Cargando datos de votación...',

    // Room finished
    winner: 'Ganador',
    points: 'puntos',
    finalScores: 'Puntuaciones Finales',
    leaveRoom: 'Salir de la Sala',

    // Time formatting
    timeRemaining: 'Tiempo Restante'
  }
}

export const getTranslations = (language: Language): Translations => {
  return translations[language]
}