"use client"

import { useState, useEffect } from "react"
import { History, Trash2, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getChatSessions,
  deleteChatSession,
  saveChatSession,
  type ChatSession,
  type StoredMessage,
} from "@/lib/local-storage"
import { formatDistanceToNow } from "date-fns"

interface ChatHistoryManagerProps {
  currentMessages: StoredMessage[]
  onLoadSession: (session: ChatSession) => void
  onSaveCurrentSession: () => void
  isOpen: boolean
  onClose: () => void
}

export default function ChatHistoryManager({
  currentMessages,
  onLoadSession,
  onSaveCurrentSession,
  isOpen,
  onClose,
}: ChatHistoryManagerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  const loadSessions = () => {
    setIsLoading(true)
    try {
      const savedSessions = getChatSessions()
      setSessions(savedSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    try {
      deleteChatSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  const handleSaveCurrentSession = () => {
    if (currentMessages.length === 0) return

    const title = generateSessionTitle(currentMessages)
    const session: ChatSession = {
      id: Date.now().toString(),
      title,
      messages: currentMessages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      saveChatSession(session)
      setSessions((prev) => [session, ...prev])
      onSaveCurrentSession()
    } catch (error) {
      console.error("Failed to save session:", error)
    }
  }

  const generateSessionTitle = (messages: StoredMessage[]): string => {
    const firstUserMessage = messages.find((m) => m.role === "user")
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
    }
    return `Chat ${new Date().toLocaleDateString()}`
  }

  if (!isOpen) return null

  return (
    <Card className="absolute top-16 left-4 right-4 z-50 p-6 shadow-xl border bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-200 max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Chat History</h3>
        </div>
        <div className="flex items-center gap-2">
          {currentMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleSaveCurrentSession}>
              <Download className="h-4 w-4 mr-2" />
              Save Current
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved conversations yet</p>
            <p className="text-sm mt-2">Start chatting to create your first session</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                onClick={() => {
                  onLoadSession(session)
                  onClose()
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">{session.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </div>
                      <span>{session.messages.length} messages</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(session.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
