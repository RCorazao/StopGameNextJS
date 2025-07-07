"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, Plus, X } from 'lucide-react'
import { PlayerState, RoomDto, TopicDto, UpdateRoomSettingsRequest } from '@/types/signalr'
import { useSignalR } from '@/contexts/SignalRContext'

interface RoomSettingsProps {
  roomData: RoomDto
  playerState: PlayerState
  onError: (error: string) => void
}

export function RoomSettings({ roomData, playerState, onError }: RoomSettingsProps) {
  const { updateRoomSettings } = useSignalR()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [topics, setTopics] = useState<string[]>(roomData.topics.map(t => t.name) || [])
  const [newTopic, setNewTopic] = useState('')
  const [settings, setSettings] = useState({
    maxPlayers: roomData.maxPlayers || 8,
    roundDurationSeconds: roomData.roundDurationSeconds || 60,
    votingDurationSeconds: roomData.votingDurationSeconds || 30,
    maxRounds: roomData.maxRounds || 5
  })

  const isHost = playerState?.id === roomData.hostUserId

  const handleAddTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const handleSaveSettings = async () => {
    try {
      setIsUpdating(true)
      
      const updateRequest: Partial<UpdateRoomSettingsRequest> = {
        topics,
        maxPlayers: settings.maxPlayers,
        roundDurationSeconds: settings.roundDurationSeconds,
        votingDurationSeconds: settings.votingDurationSeconds,
        maxRounds: settings.maxRounds
      }

      await updateRoomSettings(roomData.code, updateRequest)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update room settings:', error)
      onError('Failed to update room settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    setTopics(roomData.topics.map(t => t.name) || [])
    setSettings({
      maxPlayers: roomData.maxPlayers || 8,
      roundDurationSeconds: roomData.roundDurationSeconds || 60,
      votingDurationSeconds: roomData.votingDurationSeconds || 30,
      maxRounds: roomData.maxRounds || 5
    })
    setIsEditing(false)
  }

  if (!isHost) {
    return (
      <Card className="backdrop-blur-sm bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Room Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">Max Players</Label>
              <p className="font-medium">{roomData.maxPlayers || 8}</p>
            </div>
            <div>
              <Label className="text-gray-600">Max Rounds</Label>
              <p className="font-medium">{roomData.maxRounds || 5}</p>
            </div>
            <div>
              <Label className="text-gray-600">Round Duration</Label>
              <p className="font-medium">{roomData.roundDurationSeconds || 60}s</p>
            </div>
            <div>
              <Label className="text-gray-600">Voting Duration</Label>
              <p className="font-medium">{roomData.votingDurationSeconds || 30}s</p>
            </div>
          </div>
          
          {roomData.topics && roomData.topics.length > 0 && (
            <div>
              <Label className="text-gray-600">Custom Topics</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {roomData.topics.map((topic: TopicDto, index: number) => (
                  <Badge key={index} variant="secondary">{topic.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Room Settings
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* Game Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxPlayers">Max Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  min="2"
                  max="20"
                  value={settings.maxPlayers}
                  onChange={(e) => setSettings({...settings, maxPlayers: parseInt(e.target.value) || 8})}
                />
              </div>
              <div>
                <Label htmlFor="maxRounds">Max Rounds</Label>
                <Input
                  id="maxRounds"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxRounds}
                  onChange={(e) => setSettings({...settings, maxRounds: parseInt(e.target.value) || 5})}
                />
              </div>
              <div>
                <Label htmlFor="roundDuration">Round Duration (seconds)</Label>
                <Input
                  id="roundDuration"
                  type="number"
                  min="30"
                  max="300"
                  value={settings.roundDurationSeconds}
                  onChange={(e) => setSettings({...settings, roundDurationSeconds: parseInt(e.target.value) || 60})}
                />
              </div>
              <div>
                <Label htmlFor="votingDuration">Voting Duration (seconds)</Label>
                <Input
                  id="votingDuration"
                  type="number"
                  min="15"
                  max="120"
                  value={settings.votingDurationSeconds}
                  onChange={(e) => setSettings({...settings, votingDurationSeconds: parseInt(e.target.value) || 30})}
                />
              </div>
            </div>

            {/* Topics */}
            <div>
              <Label>Topics</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a custom topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                />
                <Button onClick={handleAddTopic} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {topic}
                      <button
                        onClick={() => handleRemoveTopic(topic)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Display Mode */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Max Players</Label>
                <p className="font-medium">{settings.maxPlayers}</p>
              </div>
              <div>
                <Label className="text-gray-600">Max Rounds</Label>
                <p className="font-medium">{settings.maxRounds}</p>
              </div>
              <div>
                <Label className="text-gray-600">Round Duration</Label>
                <p className="font-medium">{settings.roundDurationSeconds}s</p>
              </div>
              <div>
                <Label className="text-gray-600">Voting Duration</Label>
                <p className="font-medium">{settings.votingDurationSeconds}s</p>
              </div>
            </div>
            
            {topics.length > 0 && (
              <div>
                <Label className="text-gray-600">Custom Topics</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}