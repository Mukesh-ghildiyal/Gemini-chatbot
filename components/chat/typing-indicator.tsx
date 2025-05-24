"use client"

import { Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TypingIndicator() {
  return (
    <div className="py-6 px-4 bg-white dark:bg-transparent">
      <div className="max-w-4xl mx-auto flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-500 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Typing Animation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Gemini</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
