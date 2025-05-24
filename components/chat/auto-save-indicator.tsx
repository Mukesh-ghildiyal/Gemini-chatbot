"use client"

import { useState, useEffect } from "react"
import { Check, Cloud, CloudOff } from "lucide-react"

interface AutoSaveIndicatorProps {
  isActive: boolean
  lastSaved?: Date | null
  hasUnsavedChanges: boolean
}

export default function AutoSaveIndicator({ isActive, lastSaved, hasUnsavedChanges }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (!hasUnsavedChanges && lastSaved) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges, lastSaved])

  if (!isActive && !lastSaved) return null

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      {hasUnsavedChanges ? (
        <>
          <Cloud className="h-3 w-3 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : showSaved ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-600 dark:text-green-400">Saved</span>
        </>
      ) : lastSaved ? (
        <>
          <Cloud className="h-3 w-3" />
          <span>Auto-saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3" />
          <span>Not saved</span>
        </>
      )}
    </div>
  )
}
