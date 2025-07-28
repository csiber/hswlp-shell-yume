"use client"

import { useEffect, useState } from "react"

interface Comment {
  id: string
  text: string
  created_at: string
  reply_to?: string
  editable: boolean
  user: { name: string }
}

export default function CommentList({ postId, isGuest = false }: { postId: string; isGuest?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  // Restore draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`draftComment_${postId}`)
    if (saved) setText(saved)
    return () => {
      localStorage.removeItem(`draftComment_${postId}`)
    }
  }, [postId])

  // Autosave draft
  useEffect(() => {
    localStorage.setItem(`draftComment_${postId}`, text)
  }, [text, postId])

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) =>
        res.ok
          ? (res.json() as Promise<{ comments: Comment[] }>)
          : Promise.resolve({ comments: [] })
      )
      .then((data) =>
        setComments(Array.isArray(data.comments) ? data.comments : [])
      )
      .catch(() => {})
  }, [postId])

  async function submit() {
    if (isGuest || !text.trim()) return
    try {
      if (editId) {
        const res = await fetch(`/api/comments/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        })
        if (!res.ok) return
        const data = (await res.json()) as { comment: Comment }
        setComments(c => c.map(cm => (cm.id === editId ? { ...cm, text: data.comment.text } : cm)))
        setEditId(null)
      } else {
        const res = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, reply_to: replyTo ?? undefined }),
        })
        if (!res.ok) return
        const data = (await res.json()) as { comment: Comment }
        setComments((c) => [...c, data.comment])
        setReplyTo(null)
      }
      setText("")
    } catch {
      // ignore
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" })
      if (!res.ok) return
      setComments(c => c.filter(cm => cm.id !== id))
    } catch {}
  }

  return (
    <div className="mt-4 space-y-2">
      {comments.map((c) => (
        <div
          key={c.id}
          className={`border-b pb-1 text-sm ${c.reply_to ? 'ml-4 border-l pl-2' : ''}`}
        >
          {editId === c.id ? (
            <div className="flex flex-col gap-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                className="w-full rounded-md border p-1 text-sm"
              />
              <div className="flex gap-1">
                <button onClick={submit} className="text-primary text-xs">Save</button>
                <button onClick={() => { setEditId(null); setText(''); }} className="text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <span className="font-medium">{c.user.name}</span> – {c.text}
              <div className="flex gap-2 text-xs mt-1">
                <button onClick={() => setReplyTo(c.id)}>Reply</button>
                {c.editable && (
                  <>
                    <button onClick={() => { setEditId(c.id); setText(c.text); }}>Edit</button>
                    <button onClick={() => remove(c.id)}>Delete</button>
                  </>
                )}
              </div>
            </>
          )}
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
          {editId ? 'Save' : 'Post'}
        </button>
        {replyTo && !editId && (
          <button onClick={() => { setReplyTo(null); }} className="self-end text-xs">Cancel reply</button>
        )}
      </div>
    </div>
  )
}
