"use client"

import type React from "react"

import { useState } from "react"
import { Lightbulb, Code, BookOpen, Briefcase, Heart, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ConversationTemplate {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  prompt: string
  category: string
}

const templates: ConversationTemplate[] = [
  {
    id: "creative-writing",
    title: "Creative Writing",
    description: "Get help with stories, poems, and creative content",
    icon: <BookOpen className="h-5 w-5" />,
    prompt: "I'd like help with creative writing. Can you help me brainstorm ideas for a short story?",
    category: "Creative",
  },
  {
    id: "code-review",
    title: "Code Review",
    description: "Get code reviewed and optimized",
    icon: <Code className="h-5 w-5" />,
    prompt: "I have some code I'd like you to review. Can you help me optimize it and suggest improvements?",
    category: "Development",
  },
  {
    id: "business-strategy",
    title: "Business Strategy",
    description: "Discuss business ideas and strategies",
    icon: <Briefcase className="h-5 w-5" />,
    prompt: "I'm working on a business plan and would like to discuss some strategic decisions. Can you help?",
    category: "Business",
  },
  {
    id: "learning-tutor",
    title: "Learning Tutor",
    description: "Get explanations on complex topics",
    icon: <Lightbulb className="h-5 w-5" />,
    prompt: "I'm trying to understand a complex topic. Can you explain it in simple terms with examples?",
    category: "Education",
  },
  {
    id: "wellness-coach",
    title: "Wellness Coach",
    description: "Get advice on health and wellness",
    icon: <Heart className="h-5 w-5" />,
    prompt: "I'd like some guidance on improving my daily wellness routine. Can you help me create a plan?",
    category: "Health",
  },
  {
    id: "productivity-tips",
    title: "Productivity Tips",
    description: "Optimize your workflow and habits",
    icon: <Zap className="h-5 w-5" />,
    prompt: "I want to improve my productivity and time management. What strategies would you recommend?",
    category: "Productivity",
  },
]

interface ConversationTemplatesProps {
  onSelectTemplate: (prompt: string) => void
  isVisible: boolean
}

export default function ConversationTemplates({ onSelectTemplate, isVisible }: ConversationTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (!isVisible) return null

  const categories = Array.from(new Set(templates.map((t) => t.category)))
  const filteredTemplates = selectedCategory ? templates.filter((t) => t.category === selectedCategory) : templates

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Quick Start Templates</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Choose a template to get started with your conversation
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            onClick={() => onSelectTemplate(template.prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                {template.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{template.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{template.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
