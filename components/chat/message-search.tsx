"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Message = {
  id: string
  content: string
  role: "user" | "model"
  timestamp?: Date
}

interface MessageSearchProps {
  messages: Message[]
  onMessageSelect: (messageId: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function MessageSearch({ messages, onMessageSelect, isOpen, onClose }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Message[]>([])

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = messages.filter((message) => message.content.toLowerCase().includes(searchQuery.toLowerCase()))
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, messages])

  if (!isOpen) return null

  return (
    <Card className="absolute top-16 left-4 right-4 z-50 p-4 shadow-xl border bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto space-y-2">
          {searchResults.map((message) => (
            <div
              key={message.id}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => {
                onMessageSelect(message.id)
                onClose()
              }}
            >
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {message.role === "user" ? "You" : "AI"} • {message.timestamp?.toLocaleString() || "Unknown time"}
              </div>
              <div className="text-sm line-clamp-2">{message.content}</div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="text-center text-slate-500 dark:text-slate-400 py-4">No messages found</div>
      )}
    </Card>
  )
}
