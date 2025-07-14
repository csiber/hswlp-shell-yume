"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ChatBox() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    const text = content.trim()
    if (!text) return
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      })
      if (res.ok) {
        setContent('')
        window.dispatchEvent(new Event('chat:refresh'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex items-end gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="flex-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:outline-none"
      />
      <Button onClick={send} disabled={!content.trim() || loading}>
        Küldés
      </Button>
    </div>
  )
}
