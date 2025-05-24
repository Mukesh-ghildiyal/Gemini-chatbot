"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2, Send, Plus, Menu, X } from "lucide-react"
import ChatMessage from "@/components/chat/chat-message"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import TypingIndicator from "@/components/chat/typing-indicator"
import ChatSidebar from "@/components/chat/chat-sidebar"
import { useChat } from "@/hooks/use-chat"
import type { ChatSession } from "@/lib/local-storage"
import { cn } from "@/lib/utils"
import type { Message } from "@/hooks/use-chat"
// Import the new component
import AutoSaveIndicator from "@/components/chat/auto-save-indicator"

// Import the session manager
import { sessionManager } from "@/lib/session-manager"

export default function Home() {
  const {
    messages,
    isLoading,
    error,
    isRateLimited,
    addMessage,
    updateMessage,
    clearChat,
    setLoading,
    setError,
    setRateLimited,
  } = useChat()

  const [input, setInput] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  // Add a new state for tracking if current session needs saving
  const [needsSaving, setNeedsSaving] = useState(false)
  // Add state for tracking last save time
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Add useEffect to track when messages change and mark for saving
  useEffect(() => {
    if (messages.length > 0) {
      setNeedsSaving(true)
    }
  }, [messages])

  // Add useEffect for auto-saving on session changes
  useEffect(() => {
    // Auto-save current session when switching or when there are significant changes
    if (needsSaving && messages.length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        autoSaveCurrentSession()
        setNeedsSaving(false)
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [messages, needsSaving, isLoading, currentSessionId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount and when starting new chat
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentSessionId])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Reset errors
    setError(null)
    setRateLimited(false)

    // Add user message
    const userMessageId = addMessage({
      content: input,
      role: "user",
    })

    // Add placeholder for AI response
    const aiMessageId = addMessage({
      content: "",
      role: "model",
      isStreaming: true,
    })

    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: input }].map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 429) {
          setRateLimited(true)
          throw new Error(errorData.error || "Rate limit exceeded. Please try again later.")
        }

        throw new Error(errorData.error || "Failed to fetch response")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        accumulatedContent += chunk

        updateMessage(aiMessageId, { content: accumulatedContent })
      }

      // Mark streaming as complete
      updateMessage(aiMessageId, { isStreaming: false })
    } catch (error) {
      console.error("Error:", error)
      setError(error.message || "An error occurred. Please try again.")

      updateMessage(aiMessageId, {
        content: isRateLimited
          ? "I'm currently experiencing high demand and have reached my rate limit. Please try again in a few moments."
          : "Sorry, I encountered an error. Please try again.",
        isStreaming: false,
        error: true,
      })
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // Replace the autoSaveCurrentSession function with this:
  const autoSaveCurrentSession = useCallback(() => {
    if (messages.length === 0) return

    const savedSessionId = sessionManager.autoSave(currentSessionId, messages, (sessionId) => {
      setLastSaved(new Date())
      if (!currentSessionId) {
        setCurrentSessionId(sessionId)
      }
    })

    // Update session ID if it was auto-generated
    if (!currentSessionId) {
      setCurrentSessionId(savedSessionId)
    }
  }, [messages, currentSessionId])

  // Update handleNewChat to use session manager
  const handleNewChat = useCallback(() => {
    // Force save current session if it has messages
    if (messages.length > 0) {
      try {
        sessionManager.saveSession(currentSessionId || `session_${Date.now()}`, messages)
      } catch (error) {
        console.error("Failed to save session before new chat:", error)
      }
    }

    // Clear current chat and reset state
    clearChat()
    setCurrentSessionId(null)
    setError(null)
    setRateLimited(false)
    setNeedsSaving(false)
    setLastSaved(null)
  }, [messages, currentSessionId, clearChat, setError, setRateLimited])

  // Helper function to generate session title
  const generateSessionTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find((m) => m.role === "user")
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
    }
    return `Chat ${new Date().toLocaleDateString()}`
  }

  // Handle loading a chat session
  const handleLoadSession = (session: ChatSession) => {
    clearChat()
    setCurrentSessionId(session.id)

    // Load messages from session
    session.messages.forEach((msg) => {
      addMessage({
        content: msg.content,
        role: msg.role,
        error: msg.error,
      })
    })
  }

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      sessionManager.forceSaveAll()
    }
  }, [])

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700",
          isSidebarOpen ? "w-80" : "w-0",
          "md:relative absolute z-50 h-full",
        )}
      >
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewChat={handleNewChat}
          onLoadSession={handleLoadSession}
          currentSessionId={currentSessionId}
          currentMessages={messages}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{messages.length > 0 ? "Gemini AI Chat" : "New Chat"}</h1>
              <AutoSaveIndicator isActive={messages.length > 0} lastSaved={lastSaved} hasUnsavedChanges={needsSaving} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewChat} className="hidden sm:flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Error Alerts */}
        {error && (
          <Alert variant="destructive" className="m-4 animate-in slide-in-from-top duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isRateLimited && (
          <Alert className="m-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 animate-in slide-in-from-top duration-300">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Rate Limit Reached</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              The API is currently experiencing high demand. Please try again in a few moments.
            </AlertDescription>
          </Alert>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">How can I help you today?</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  I'm Gemini, an AI assistant. I can help you with questions, creative tasks, analysis, and much more.
                  What would you like to explore?
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  theme={theme}
                  isLatest={index === messages.length - 1}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Gemini..."
                    disabled={isLoading}
                    className="border-0 bg-transparent focus:ring-0 focus:outline-none resize-none text-base placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    style={{ boxShadow: "none" }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg h-8 w-8 flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Gemini may display inaccurate info, including about people, so double-check its responses.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}
