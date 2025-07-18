"use client"

import { Quote } from "lucide-react"

export default function PromptBox({
  text,
  lines = 5,
}: {
  text: string
  lines?: number
}) {
  const parts = text.split(/\r?\n/)
  const truncated = parts.slice(0, lines).join("\n")
  const hasMore = parts.length > lines

  return (
    <blockquote className="relative rounded-xl bg-gray-50 dark:bg-zinc-800 p-4 text-sm italic whitespace-pre-wrap">
      <Quote className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
      {hasMore ? `${truncated}\n...` : truncated}
    </blockquote>
  )
}

