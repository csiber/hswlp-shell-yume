"use client"

import { useEffect, useState } from "react"

interface Comment {
  id: string
  text: string
  user: { name: string }
}

export default function CommentList({ postId, isGuest = false }: { postId: string; isGuest?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data: { comments: Comment[] }) => setComments(Array.isArray(data.comments) ? data.comments : []))
      .catch(() => {})
  }, [postId])

  async function submit() {
    if (isGuest || !text.trim()) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { comment: Comment }
      setComments((c) => [...c, data.comment])
      setText("")
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="border-b pb-1 text-sm">
          <span className="font-medium">{c.user.name}</span> – {c.text}
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          disabled={isGuest}
          placeholder={isGuest ? "Login required" : "Write a comment..."}
          className="w-full rounded-md border p-2 text-sm"
        />
        <button
          onClick={submit}
          disabled={isGuest}
          className={`self-end rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
        >
          Post
        </button>
      </div>
    </div>
  )
}
