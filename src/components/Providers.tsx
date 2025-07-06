"use client"

import React from 'react'
import { SignalRProvider } from '@/contexts/SignalRContext'

interface ProvidersProps {
  children: React.ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SignalRProvider>
      {children}
    </SignalRProvider>
  )
}

export default Providers