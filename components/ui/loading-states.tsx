"use client"

import type React from "react"

import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// Inline loading spinner
export function InlineLoader({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}

// Message loading skeleton
export function MessageSkeleton() {
  return (
    <div className="flex justify-start animate-pulse">
      <div className="flex gap-3 max-w-[85%] md:max-w-[75%]">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 min-w-[200px]">
          <div className="space-y-2">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chat loading overlay
export function ChatLoadingOverlay({ message = "Loading chat..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  )
}

// Button loading state
export function LoadingButton({
  isLoading,
  children,
  loadingText = "Loading...",
  ...props
}: {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <InlineLoader />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  )
}
