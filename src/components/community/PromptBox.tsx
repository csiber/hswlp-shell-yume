"use client"

import { Quote } from "lucide-react"

export default function PromptBox({ text }: { text: string }) {
  return (
    <blockquote className="relative rounded-xl bg-gray-50 dark:bg-zinc-800 p-4 text-sm italic">
      <Quote className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
      {text}
    </blockquote>
  )
}

