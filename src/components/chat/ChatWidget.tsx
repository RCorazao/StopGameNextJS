"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSignalR } from "@/contexts/SignalRContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ChatNotification } from "@/types/signalr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"

export const ChatWidget: React.FC = () => {
  const pathname = usePathname()
  const { connection, isConnected } = useSignalR()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const chatRef = useRef<HTMLDivElement | null>(null)
  const toggleRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Hide on root route only
  const isHidden = useMemo(() => pathname === "/", [pathname])

  // Subscribe to ChatNotification events
  useEffect(() => {
    if (!connection || !isConnected) return

    const handler = (notification: ChatNotification) => {
      setMessages(prev => [...prev, notification])
      if (!isOpen) {
        setUnreadCount(c => c + 1)
      }
    }

    connection.on("ChatNotification", handler)

    return () => {
      connection.off("ChatNotification", handler)
    }
  }, [connection, isConnected, isOpen])

  // Auto-scroll to bottom when messages change and panel is open
  useEffect(() => {
    if (!isOpen) return
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isOpen])

  // Handle mobile keyboard by tracking visual viewport changes
  useEffect(() => {
    if (!isOpen) return
    const vv = (window as any).visualViewport as VisualViewport | undefined
    if (!vv) return

    const updateOffset = () => {
      // Calculate how much the visual viewport is reduced by the keyboard
      const offset = Math.max(0, (window.innerHeight - vv.height))
      setKeyboardOffset(offset)
    }

    updateOffset()
    vv.addEventListener('resize', updateOffset)
    vv.addEventListener('scroll', updateOffset)
    return () => {
      vv.removeEventListener('resize', updateOffset)
      vv.removeEventListener('scroll', updateOffset)
    }
  }, [isOpen])

  // Reset unread when opening
  useEffect(() => {
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      // Ignore clicks inside chat panel
      if (chatRef.current && chatRef.current.contains(target)) return
      // Ignore clicks on toggle button area to allow proper toggle behavior
      if (toggleRef.current && toggleRef.current.contains(target)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [isOpen])

  const handleSend = useCallback(async () => {
    const msg = newMessage.trim()
    if (!msg || !connection || !isConnected) return
    try {
      setIsSending(true)
      await connection.invoke('SendChat', msg)
      setNewMessage("")
    } catch (e) {
      console.error('Failed to send chat message', e)
    } finally {
      setIsSending(false)
    }
  }, [newMessage, connection, isConnected])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isHidden) return null

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative" ref={toggleRef}>
          <Button onClick={() => setIsOpen(o => !o)} className="rounded-full shadow-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            {t.chat}
          </Button>
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 shadow">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-4 z-50 w-80 sm:w-96" style={{ bottom: `calc(5rem + ${keyboardOffset}px)` }}>
          <div
            ref={chatRef}
            className="transform transition-all duration-200 origin-bottom-right opacity-100 translate-y-0 scale-100"
          >
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border shadow-xl">
              <CardHeader className="px-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.chat}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={scrollRef} className="max-h-96 h-80 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center mt-6">{t.noMessagesYet}</p>
                  ) : (
                    messages.map((m, idx) => {
                      const isSystem = m.source === "System"
                      const author = isSystem ? "System" : (m.player?.name || "Player")
                      const time = (() => {
                        try {
                          return new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        } catch {
                          return m.timestamp
                        }
                      })()
                      return (
                        <div key={idx} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className={isSystem ? "font-semibold text-blue-600" : "font-semibold"}>{author}</span>
                            <span className="text-xs text-muted-foreground">{time}</span>
                          </div>
                          <div className="whitespace-pre-wrap break-words text-foreground bg-muted/50 rounded-md px-2 py-1 mt-0.5">
                            {m.message}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="border-t p-2 flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => {
                      // Make sure chat is visible above the keyboard and input is in view
                      setTimeout(() => {
                        inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
                      }, 50)
                    }}
                    placeholder={t.typeMessage}
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim() || isSending} size="icon" aria-label={t.send}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget