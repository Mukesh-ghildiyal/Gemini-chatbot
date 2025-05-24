"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Message = {
  id: string
  content: string
  role: "user" | "model"
  isStreaming?: boolean
}

interface ChatExportProps {
  messages: Message[]
}

export default function ChatExport({ messages }: ChatExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Export as plain text
  const exportAsText = () => {
    setIsExporting(true)
    try {
      const text = messages.map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`).join("\n\n")

      downloadFile(text, "gemini-chat-export.txt", "text/plain")
    } finally {
      setIsExporting(false)
    }
  }

  // Export as JSON
  const exportAsJSON = () => {
    setIsExporting(true)
    try {
      const data = messages.map(({ id, content, role }) => ({ id, content, role }))
      const json = JSON.stringify(data, null, 2)

      downloadFile(json, "gemini-chat-export.json", "application/json")
    } finally {
      setIsExporting(false)
    }
  }

  // Helper function to download a file
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={messages.length === 0 || isExporting}>
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText}>Export as Text</DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>Export as JSON</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
