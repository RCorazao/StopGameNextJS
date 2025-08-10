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

interface ISettings {
  maxPlayers: number;
  roundDurationSeconds: number;
  votingDurationSeconds: number;
  maxRounds: number;
}

type SettingKey = keyof ISettings;

const SETTINGS_CONFIG = {
  maxPlayers:           { min: 2,  max: 10,  default: 4  },
  roundDurationSeconds: { min: 60, max: 180, default: 60 },
  votingDurationSeconds:{ min: 30,  max: 90,  default: 30 },
  maxRounds:            { min: 1,  max: 5,  default: 3  },
};

export function RoomSettings({ roomData, playerState, onError }: RoomSettingsProps) {
  const { updateRoomSettings } = useSignalR()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [topics, setTopics] = useState<string[]>(roomData.topics.map(t => t.name) || [])
  const [newTopic, setNewTopic] = useState('')
  const [settings, setSettings] = useState<ISettings>({
    maxPlayers: roomData.maxPlayers || SETTINGS_CONFIG.maxPlayers.default,
    roundDurationSeconds: roomData.roundDurationSeconds || SETTINGS_CONFIG.roundDurationSeconds.default,
    votingDurationSeconds: roomData.votingDurationSeconds || SETTINGS_CONFIG.votingDurationSeconds.default,
    maxRounds: roomData.maxRounds || SETTINGS_CONFIG.maxRounds.default
  });
  const [inputValues, setInputValues] = useState<ISettings>(settings);

  const isHost = playerState?.id === roomData.hostUserId

  const handleInputChange = (field: SettingKey, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBlur = (field: SettingKey) => {
    const config = SETTINGS_CONFIG[field];
    let finalValue = parseInt(String(inputValues[field]), 10);

    if (isNaN(finalValue)) {
      finalValue = config.default;
    }

    if (finalValue < config.min) {
      finalValue = config.min;
    } else if (finalValue > config.max) {
      finalValue = config.max;
    }

    setSettings(prev => ({ ...prev, [field]: finalValue }));
    setInputValues(prev => ({ ...prev, [field]: finalValue }));
  };

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
      maxPlayers: roomData.maxPlayers || SETTINGS_CONFIG.maxPlayers.default,
      roundDurationSeconds: roomData.roundDurationSeconds || SETTINGS_CONFIG.roundDurationSeconds.default,
      votingDurationSeconds: roomData.votingDurationSeconds || SETTINGS_CONFIG.votingDurationSeconds.default,
      maxRounds: roomData.maxRounds || SETTINGS_CONFIG.maxRounds.default
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
              <p className="font-medium">{roomData.maxPlayers || SETTINGS_CONFIG.maxPlayers.default}</p>
            </div>
            <div>
              <Label className="text-gray-600">Max Rounds</Label>
              <p className="font-medium">{roomData.maxRounds || SETTINGS_CONFIG.maxRounds.default}</p>

            </div>
            <div>
              <Label className="text-gray-600">Round Duration</Label>
              <p className="font-medium">{roomData.roundDurationSeconds || SETTINGS_CONFIG.roundDurationSeconds.default}s</p>
            </div>
            <div>
              <Label className="text-gray-600">Voting Duration</Label>
              <p className="font-medium">{roomData.votingDurationSeconds || SETTINGS_CONFIG.votingDurationSeconds.default}s</p>
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
                <Label htmlFor="maxPlayers">Max Players (2-10)</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={inputValues.maxPlayers}
                  onChange={(e) => handleInputChange('maxPlayers', e.target.value)}
                  onBlur={() => handleBlur('maxPlayers')}
                />
              </div>
              <div>
                <Label htmlFor="maxRounds">Max Rounds (1-5)</Label>
                <Input
                  id="maxRounds"
                  type="number"
                  value={inputValues.maxRounds}
                  onChange={(e) => handleInputChange('maxRounds', e.target.value)}
                  onBlur={() => handleBlur('maxRounds')}
                />
              </div>
              <div>
                <Label htmlFor="roundDuration">Round Duration (60-180s)</Label>
                <Input
                  id="roundDurationSeconds"
                  type="number"
                  value={inputValues.roundDurationSeconds}
                  onChange={(e) => handleInputChange('roundDurationSeconds', e.target.value)}
                  onBlur={() => handleBlur('roundDurationSeconds')}
                />
              </div>
              <div>
                <Label htmlFor="votingDuration">Voting Duration (30-90s)</Label>
                <Input
                  id="votingDurationSeconds"
                  type="number"
                  value={inputValues.votingDurationSeconds}
                  onChange={(e) => handleInputChange('votingDurationSeconds', e.target.value)}
                  onBlur={() => handleBlur('votingDurationSeconds')}
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