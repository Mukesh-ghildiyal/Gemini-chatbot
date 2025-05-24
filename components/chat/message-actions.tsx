"use client"

import { useState } from "react"
import { MoreVertical, Copy, Trash2, Edit, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Message = {
  id: string
  content: string
  role: "user" | "model"
  timestamp?: Date
}

interface MessageActionsProps {
  message: Message
  onCopy: () => void
  onDelete: () => void
  onRegenerate?: () => void
  onEdit?: () => void
}

export default function MessageActions({ message, onCopy, onDelete, onRegenerate, onEdit }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-in slide-in-from-top-2 duration-200">
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
          {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </DropdownMenuItem>

        {message.role === "user" && onEdit && (
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}

        {message.role === "model" && onRegenerate && (
          <DropdownMenuItem onClick={onRegenerate} className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 dark:text-red-400">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
