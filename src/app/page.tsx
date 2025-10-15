"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play } from "lucide-react"
import { useSignalR } from "@/contexts/SignalRContext"
import { useLanguage } from "@/contexts/LanguageContext"
import ConnectionStatus from "@/components/ConnectionStatus"
import { CreateRoomDialog } from "@/components/home/CreateRoomDialog"
import { JoinRoomDialog } from "@/components/home/JoinRoomDialog"
import { LanguageSelector } from "@/components/LanguageSelector"

export default function HomePage() {
  const [playerName, setPlayerName] = useState("")
  const { isConnected } = useSignalR()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        {/* Connection Status */}
        <ConnectionStatus />

        {/* Header */}
        <div className="text-center text-white space-y-2">
          <h1 className="text-4xl font-bold">Stop Game</h1>
          <p className="text-lg opacity-90">Tutti Frutti Multiplayer</p>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Play className="w-6 h-6" />
              {t.readyToPlay}
            </CardTitle>
            <CardDescription>{t.enterNameAndRoom}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">{t.yourName}</Label>
              <Input
                id="playerName"
                placeholder={t.enterYourName}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CreateRoomDialog
                playerName={playerName}
                isConnected={isConnected}
              />

              <JoinRoomDialog
                playerName={playerName}
                isConnected={isConnected}
              />
            </div>
          </CardContent>
        </Card>

        {/* Android App Download */}
        <Card className="backdrop-blur-sm bg-white/80 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {t.getAndroidApp}
            </CardTitle>
            <CardDescription>
              {t.downloadApkDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>{t.installNote}</strong> {t.installNoteText}
              </p>
            </div>
            <a
              href="/downloads/stop-game.apk"
              download="stop-game.apk"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
            >
              {t.downloadApk}
            </a>
            <p className="text-xs text-gray-600 text-center">
              {t.comingSoonPlayStore}
            </p>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">{t.howToPlay}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{t.rule1}</p>
            <p>{t.rule2}</p>
            <p>{t.rule3}</p>
            <p>{t.rule4}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

