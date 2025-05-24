"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Plus, MessageSquare, Search, MoreHorizontal, Trash2, Edit, Check, X, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getChatSessions, saveChatSession, deleteChatSession, type ChatSession } from "@/lib/local-storage"
import { isToday, isYesterday, format } from "date-fns"
import type { Message } from "@/hooks/use-chat"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onLoadSession: (session: ChatSession) => void
  currentSessionId: string | null
  currentMessages: Message[]
}

export default function ChatSidebar({
  isOpen,
  onClose,
  onNewChat,
  onLoadSession,
  currentSessionId,
  currentMessages,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  // Add a state to track if sessions need reloading
  const [shouldReloadSessions, setShouldReloadSessions] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  // Remove or comment out this useEffect:
  // useEffect(() => {
  //   if (currentMessages.length > 0 && currentSessionId) {
  //     autoSaveCurrentSession()
  //   }
  // }, [currentMessages, currentSessionId])

  // Update loadSessions to be more robust
  const loadSessions = useCallback(() => {
    try {
      const savedSessions = getChatSessions()
      setSessions(savedSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
    } catch (error) {
      console.error("Failed to load sessions:", error)
      setSessions([])
    }
  }, [])

  // Add useEffect to reload sessions when needed
  useEffect(() => {
    if (shouldReloadSessions) {
      loadSessions()
      setShouldReloadSessions(false)
    }
  }, [shouldReloadSessions, loadSessions])

  // Add useEffect to listen for session changes
  useEffect(() => {
    // Listen for storage changes to update sessions in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gemini-chat-sessions") {
        setShouldReloadSessions(true)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Add periodic refresh of sessions
  useEffect(() => {
    const interval = setInterval(() => {
      loadSessions()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [loadSessions])

  const autoSaveCurrentSession = () => {
    if (!currentSessionId || currentMessages.length === 0) return

    const existingSession = sessions.find((s) => s.id === currentSessionId)
    if (!existingSession) return

    const updatedSession: ChatSession = {
      ...existingSession,
      messages: currentMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp.toISOString(),
        error: msg.error,
      })),
      updatedAt: new Date().toISOString(),
    }

    saveChatSession(updatedSession)
    loadSessions()
  }

  const handleNewChat = () => {
    onNewChat()
  }

  const generateSessionTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find((m) => m.role === "user")
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
    }
    return `Chat ${format(new Date(), "MMM d")}`
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteChatSession(sessionId)
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (currentSessionId === sessionId) {
      onNewChat()
    }
  }

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return

    const updatedSession: ChatSession = {
      ...session,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    }

    saveChatSession(updatedSession)
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)))
    setEditingSessionId(null)
    setEditingTitle("")
  }

  const startEditing = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  }

  const cancelEditing = () => {
    setEditingSessionId(null)
    setEditingTitle("")
  }

  const filteredSessions = sessions.filter((session) => session.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const groupedSessions = groupSessionsByDate(filteredSessions)

  if (!isOpen) return null

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        {Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => (
          <div key={dateGroup} className="mb-4">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {dateGroup}
            </div>
            <div className="space-y-1">
              {groupSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative rounded-lg transition-colors",
                    currentSessionId === session.id
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {editingSessionId === session.id ? (
                    <div className="flex items-center gap-2 p-3">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSession(session.id, editingTitle)
                          } else if (e.key === "Escape") {
                            cancelEditing()
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleRenameSession(session.id, editingTitle)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => onLoadSession(session)}>
                      <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {session.messages.length} messages
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(session)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? "No chats found" : "No chat history yet"}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <User className="h-4 w-4" />
              <span className="flex-1 text-left">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Helper function to group sessions by date
function groupSessionsByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
  const groups: Record<string, ChatSession[]> = {}

  sessions.forEach((session) => {
    const date = new Date(session.updatedAt)
    let groupKey: string

    if (isToday(date)) {
      groupKey = "Today"
    } else if (isYesterday(date)) {
      groupKey = "Yesterday"
    } else if (date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      groupKey = "Previous 7 days"
    } else if (date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      groupKey = "Previous 30 days"
    } else {
      groupKey = format(date, "MMMM yyyy")
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(session)
  })

  return groups
}
