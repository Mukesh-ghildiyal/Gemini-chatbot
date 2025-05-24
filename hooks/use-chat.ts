"use client"

import { useState, useCallback, useEffect } from "react"
import { saveMessages, loadMessages, clearMessages, type StoredMessage } from "@/lib/local-storage"

export type Message = {
  id: string
  content: string
  role: "user" | "model"
  isStreaming?: boolean
  timestamp: Date
  error?: boolean
}

export type ChatState = {
  messages: Message[]
  isLoading: boolean
  error: string | null
  isRateLimited: boolean
  lastActivity: Date | null
}

export type ChatActions = {
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string
  updateMessage: (id: string, updates: Partial<Message>) => void
  deleteMessage: (id: string) => void
  clearChat: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setRateLimited: (rateLimited: boolean) => void
  regenerateMessage: (messageId: string) => void
  editMessage: (id: string, newContent: string) => void
  getCurrentSession: () => { messages: Message[]; hasMessages: boolean }
  getCurrentSessionData: () => {
    messages: Message[]
    hasMessages: boolean
    messageCount: number
    lastActivity: Date | null
  }
}

export function useChat(): ChatState & ChatActions {
  // Initialize state from localStorage
  const [state, setState] = useState<ChatState>(() => {
    if (typeof window !== "undefined") {
      const savedMessages = loadMessages()
      return {
        messages: savedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          isStreaming: false,
        })),
        isLoading: false,
        error: null,
        isRateLimited: false,
        lastActivity: savedMessages.length > 0 ? new Date() : null,
      }
    }
    return {
      messages: [],
      isLoading: false,
      error: null,
      isRateLimited: false,
      lastActivity: null,
    }
  })

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (state.messages.length === 0) return

    // Don't save if any message is still streaming
    if (state.messages.some((m) => m.isStreaming)) return

    const storedMessages: StoredMessage[] = state.messages.map(({ id, content, role, timestamp, error }) => ({
      id,
      content,
      role,
      timestamp: timestamp.toISOString(),
      error,
    }))

    saveMessages(storedMessages)
  }, [state.messages])

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [state.error])

  // Actions
  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastActivity: new Date(),
    }))

    return id
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
      lastActivity: new Date(),
    }))
  }, [])

  const deleteMessage = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((msg) => msg.id !== id),
      lastActivity: new Date(),
    }))
  }, [])

  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      isRateLimited: false,
      lastActivity: null,
    })
    clearMessages()
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, isRateLimited: false }))
  }, [])

  const setRateLimited = useCallback((rateLimited: boolean) => {
    setState((prev) => ({ ...prev, isRateLimited: rateLimited, error: rateLimited ? prev.error : null }))
  }, [])

  const regenerateMessage = useCallback(
    (messageId: string) => {
      const messageIndex = state.messages.findIndex((m) => m.id === messageId)
      if (messageIndex === -1 || state.messages[messageIndex].role !== "model") return

      // Remove the message and all messages after it
      setState((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, messageIndex),
      }))
    },
    [state.messages],
  )

  const editMessage = useCallback(
    (id: string, newContent: string) => {
      const messageIndex = state.messages.findIndex((m) => m.id === id)
      if (messageIndex === -1) return

      // Update the message and remove all messages after it
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages.slice(0, messageIndex),
          { ...prev.messages[messageIndex], content: newContent, timestamp: new Date() },
        ],
        lastActivity: new Date(),
      }))
    },
    [state.messages],
  )

  const getCurrentSession = useCallback(() => {
    return {
      messages: state.messages,
      hasMessages: state.messages.length > 0,
    }
  }, [state.messages])

  const getCurrentSessionData = useCallback(() => {
    return {
      messages: state.messages,
      hasMessages: state.messages.length > 0,
      messageCount: state.messages.length,
      lastActivity: state.lastActivity,
    }
  }, [state.messages, state.lastActivity])

  return {
    ...state,
    addMessage,
    updateMessage,
    deleteMessage,
    clearChat,
    setLoading,
    setError,
    setRateLimited,
    regenerateMessage,
    editMessage,
    getCurrentSession,
    getCurrentSessionData,
  }
}
