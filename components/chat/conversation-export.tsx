"use client"

import { useState } from "react"
import { Download, FileText, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Message = {
  id: string
  content: string
  role: "user" | "model"
  timestamp?: Date
}

interface ConversationExportProps {
  messages: Message[]
}

export default function ConversationExport({ messages }: ConversationExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportAsText = async () => {
    setIsExporting(true)
    try {
      const text = messages
        .map((m) => {
          const timestamp = m.timestamp ? m.timestamp.toLocaleString() : "Unknown time"
          const sender = m.role === "user" ? "You" : "AI"
          return `[${timestamp}] ${sender}: ${m.content}`
        })
        .join("\n\n")

      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gemini-chat-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsJSON = async () => {
    setIsExporting(true)
    try {
      const data = {
        exportDate: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          role: m.role,
          timestamp: m.timestamp?.toISOString(),
        })),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gemini-chat-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={messages.length === 0 || isExporting}
          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:border-blue-800 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-in slide-in-from-top-2 duration-200">
        <DropdownMenuItem onClick={exportAsText} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer">
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
