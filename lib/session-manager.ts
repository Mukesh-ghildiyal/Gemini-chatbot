"use client"

import { saveChatSession, getChatSessions, type ChatSession } from "./local-storage"
import type { Message } from "@/hooks/use-chat"

export class SessionManager {
  private static instance: SessionManager
  private saveTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly SAVE_DELAY = 2000 // 2 seconds

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // Auto-save with debouncing
  autoSave(sessionId: string | null, messages: Message[], onSaved?: (sessionId: string) => void): string {
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Clear existing timeout for this session
    const existingTimeout = this.saveTimeouts.get(finalSessionId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.saveSession(finalSessionId, messages)
      this.saveTimeouts.delete(finalSessionId)
      onSaved?.(finalSessionId)
    }, this.SAVE_DELAY)

    this.saveTimeouts.set(finalSessionId, timeout)
    return finalSessionId
  }

  // Immediate save
  saveSession(sessionId: string, messages: Message[]): void {
    if (messages.length === 0) return

    const title = this.generateTitle(messages)
    const existingSessions = getChatSessions()
    const existingSession = existingSessions.find((s) => s.id === sessionId)

    const session: ChatSession = {
      id: sessionId,
      title,
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp.toISOString(),
        error: msg.error,
      })),
      createdAt: existingSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      saveChatSession(session)
    } catch (error) {
      console.error("Failed to save session:", error)
      throw error
    }
  }

  // Force save all pending sessions
  forceSaveAll(): void {
    this.saveTimeouts.forEach((timeout, sessionId) => {
      clearTimeout(timeout)
    })
    this.saveTimeouts.clear()
  }

  private generateTitle(messages: Message[]): string {
    const firstUserMessage = messages.find((m) => m.role === "user")
    if (firstUserMessage) {
      const content = firstUserMessage.content.trim()
      return content.length > 50 ? content.slice(0, 50) + "..." : content
    }
    return `Chat ${new Date().toLocaleDateString()}`
  }

  // Clean up timeouts
  destroy(): void {
    this.saveTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.saveTimeouts.clear()
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    sessionManager.forceSaveAll()
  })
}
