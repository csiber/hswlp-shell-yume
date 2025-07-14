"use client"

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { useSessionStore } from '@/state/session'

dayjs.extend(relativeTime)

interface Comment {
  id: string
  content: string
  created_at: string
  user: { name: string }
}

export default function CommentBox({ uploadId, currentUserId }: { uploadId: string; currentUserId?: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const sessionUserId = useSessionStore((s) => s.session?.user?.id)
  const userId = sessionUserId || currentUserId

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/comment?upload_id=${uploadId}`)
        if (!res.ok) return
        const data = (await res.json()) as { comments: Comment[] }
        setComments(data.comments)
      } catch {
        // ignore
      }
    }
    load()
  }, [uploadId])

  async function submit() {
    const text = content.trim()
    if (text.length < 2) return
    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_id: uploadId, content: text })
      })
      if (!res.ok) return
      const data = (await res.json()) as { comment: Comment }
      setComments((c) => [...c, data.comment])
      setContent('')
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Hozzászólások</h4>
      {comments.length ? (
        <div className="space-y-2 text-sm">
          {comments.map((c) => (
            <div key={c.id} className="border-b border-gray-200 dark:border-zinc-700 pb-1">
              <p className="leading-none">
                <span className="font-medium">{c.user.name}</span>{' '}
                <span className="text-xs text-gray-500">{dayjs(c.created_at).fromNow()}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Még nincs hozzászólás ehhez a feltöltéshez.</p>
      )}
      {userId && (
        <div className="relative mt-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 bg-white dark:bg-zinc-800 p-2 pr-8 text-sm focus:outline-none"
          />
          <button
            onClick={submit}
            className="absolute bottom-1.5 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
