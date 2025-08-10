"use client"

import React from 'react'
import { SignalRProvider } from '@/contexts/SignalRContext'
import ChatWidget from '@/components/chat/ChatWidget'

interface ProvidersProps {
  children: React.ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SignalRProvider>
      {children}
      <ChatWidget />
    </SignalRProvider>
  )
}

export default Providers