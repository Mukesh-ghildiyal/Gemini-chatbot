"use client"

import { useState } from "react"
import { Check, Copy, User, Bot, MoreVertical, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"

type Message = {
  id: string
  content: string
  role: "user" | "model"
  isStreaming?: boolean
  timestamp?: Date
  error?: boolean
}

interface ChatMessageProps {
  message: Message
  theme?: string | undefined
  isLatest?: boolean
}

export default function ChatMessage({ message, theme, isLatest }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"
  const isStreaming = message.isStreaming

  return (
    <div
      className={cn(
        "group relative py-6 px-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
        isUser ? "bg-gray-50 dark:bg-gray-800/30" : "bg-white dark:bg-transparent",
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn(isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white")}>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{isUser ? "You" : "Gemini"}</span>
            {message.timestamp && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none prose-sm">
            {isUser ? (
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{message.content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={theme === "dark" ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !mt-2 !mb-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    )
                  },
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed text-gray-900 dark:text-gray-100">{children}</p>
                  ),
                  ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1 list-disc list-inside">{children}</ul>,
                  ol: ({ children }) => (
                    <ol className="mb-3 last:mb-0 space-y-1 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed text-gray-900 dark:text-gray-100">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100">{children}</h3>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}

            {isStreaming && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Message Actions */}
          {!isStreaming && (
            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>

              {!isUser && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {!isUser && (
                    <DropdownMenuItem>
                      <Bot className="h-4 w-4 mr-2" />
                      Regenerate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
