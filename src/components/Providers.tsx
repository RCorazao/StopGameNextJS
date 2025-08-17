"use client"

import React from "react"
import { SignalRProvider } from "@/contexts/SignalRContext"
import ChatWidget from "@/components/chat/ChatWidget"
import { usePathname } from "next/navigation"

interface ProvidersProps {
  children: React.ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const pathname = usePathname()

  return (
    <SignalRProvider>
      {children}
      <ChatWidget key={pathname} />
    </SignalRProvider>
  )
}

export default Providers