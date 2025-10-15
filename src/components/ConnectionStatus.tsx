"use client"

import React from 'react'
import { useSignalR } from '@/contexts/SignalRContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card } from '@/components/ui/card'

const ConnectionStatus: React.FC = () => {
  const { connectionState, isConnected } = useSignalR()
  const { t } = useLanguage()

  const getStatusColor = () => {
    switch (connectionState) {
      case 'Connected':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'Connecting':
      case 'Reconnecting':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'Disconnected':
      case 'Failed':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'Connected':
        return '🟢'
      case 'Connecting':
      case 'Reconnecting':
        return '🟡'
      case 'Disconnected':
      case 'Failed':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const getStatusText = () => {
    switch (connectionState) {
      case 'Connected':
        return t.connected
      case 'Connecting':
      case 'Reconnecting':
        return t.connecting
      case 'Disconnected':
      case 'Failed':
        return t.disconnected
      default:
        return t.disconnected
    }
  }

  // Only show if not connected or in transition states
  if (isConnected && connectionState === 'Connected') {
    return null
  }

  return (
    <Card className={`p-3 mb-4 border-2 ${getStatusColor()}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-lg">{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
        {(connectionState === 'Connecting' || connectionState === 'Reconnecting') && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ConnectionStatus