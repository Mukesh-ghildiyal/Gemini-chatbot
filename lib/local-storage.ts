// Enhanced local storage utility functions for chat persistence

export type StoredMessage = {
  id: string
  content: string
  role: "user" | "model"
  timestamp: string
  error?: boolean
}

export type ChatSession = {
  id: string
  title: string
  messages: StoredMessage[]
  createdAt: string
  updatedAt: string
}

// Keys for storing data in localStorage
const STORAGE_KEYS = {
  CURRENT_CHAT: "gemini-current-chat",
  CHAT_SESSIONS: "gemini-chat-sessions",
  USER_PREFERENCES: "gemini-user-preferences",
} as const

// User preferences type
export type UserPreferences = {
  theme: "light" | "dark" | "system"
  autoSave: boolean
  maxHistoryLength: number
  exportFormat: "text" | "json"
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  autoSave: true,
  maxHistoryLength: 1000,
  exportFormat: "text",
}

// Utility function to safely access localStorage
function safeLocalStorage() {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return window.localStorage
  } catch {
    return null
  }
}

// Current chat messages functions
export function saveMessages(messages: StoredMessage[]): void {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    // Limit the number of messages to prevent localStorage overflow
    const preferences = getUserPreferences()
    const limitedMessages = messages.slice(-preferences.maxHistoryLength)

    storage.setItem(STORAGE_KEYS.CURRENT_CHAT, JSON.stringify(limitedMessages))
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error)
  }
}

export function loadMessages(): StoredMessage[] {
  const storage = safeLocalStorage()
  if (!storage) return []

  try {
    const saved = storage.getItem(STORAGE_KEYS.CURRENT_CHAT)
    if (saved) {
      const messages = JSON.parse(saved) as StoredMessage[]
      // Validate message structure
      return messages.filter((msg) => msg.id && msg.content && msg.role && msg.timestamp)
    }
  } catch (error) {
    console.error("Failed to load messages from localStorage:", error)
  }
  return []
}

export function clearMessages(): void {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    storage.removeItem(STORAGE_KEYS.CURRENT_CHAT)
  } catch (error) {
    console.error("Failed to clear messages from localStorage:", error)
  }
}

// Chat sessions functions
export function saveChatSession(session: ChatSession): void {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    const sessions = getChatSessions()
    const existingIndex = sessions.findIndex((s) => s.id === session.id)

    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }

    // Keep only the last 50 sessions
    const limitedSessions = sessions.slice(-50)
    storage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(limitedSessions))
  } catch (error) {
    console.error("Failed to save chat session:", error)
  }
}

export function getChatSessions(): ChatSession[] {
  const storage = safeLocalStorage()
  if (!storage) return []

  try {
    const saved = storage.getItem(STORAGE_KEYS.CHAT_SESSIONS)
    if (saved) {
      return JSON.parse(saved) as ChatSession[]
    }
  } catch (error) {
    console.error("Failed to load chat sessions:", error)
  }
  return []
}

export function deleteChatSession(sessionId: string): void {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    const sessions = getChatSessions()
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)
    storage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(filteredSessions))
  } catch (error) {
    console.error("Failed to delete chat session:", error)
  }
}

// User preferences functions
export function getUserPreferences(): UserPreferences {
  const storage = safeLocalStorage()
  if (!storage) return DEFAULT_PREFERENCES

  try {
    const saved = storage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    if (saved) {
      const preferences = JSON.parse(saved) as Partial<UserPreferences>
      return { ...DEFAULT_PREFERENCES, ...preferences }
    }
  } catch (error) {
    console.error("Failed to load user preferences:", error)
  }
  return DEFAULT_PREFERENCES
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    const currentPreferences = getUserPreferences()
    const updatedPreferences = { ...currentPreferences, ...preferences }
    storage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences))
  } catch (error) {
    console.error("Failed to save user preferences:", error)
  }
}

// Utility functions
export function getStorageUsage(): { used: number; available: number; percentage: number } {
  const storage = safeLocalStorage()
  if (!storage) return { used: 0, available: 0, percentage: 0 }

  try {
    let used = 0
    for (const key in storage) {
      if (storage.hasOwnProperty(key)) {
        used += storage[key].length + key.length
      }
    }

    // Estimate available space (most browsers have ~5-10MB limit)
    const estimated = 5 * 1024 * 1024 // 5MB
    const percentage = (used / estimated) * 100

    return {
      used,
      available: estimated - used,
      percentage: Math.min(percentage, 100),
    }
  } catch (error) {
    console.error("Failed to calculate storage usage:", error)
    return { used: 0, available: 0, percentage: 0 }
  }
}

export function clearAllData(): void {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      storage.removeItem(key)
    })
  } catch (error) {
    console.error("Failed to clear all data:", error)
  }
}
