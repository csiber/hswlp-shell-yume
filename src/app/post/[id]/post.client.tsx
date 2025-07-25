"use client"

import useSWR from 'swr'
import { useSessionStore } from '@/state/session'
import PromptBox from '@/components/community/PromptBox'

interface ApiResponse {
  post: {
    id: string
    title: string
    description?: string | null
    prompt?: string | null
    tags?: string | null
    url: string
    author: string
    is_public: boolean
    is_nsfw: boolean
  }
}

export default function PostClient({ id }: { id: string }) {
  const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<ApiResponse>)
  const { data } = useSWR<ApiResponse>(`/api/post/${id}`, fetcher)
  const session = useSessionStore(s => s.session)

  if (!data) return <div className="p-4">Betöltés...</div>
  const { post } = data
  const guest = !session?.user?.id
  const blurred = guest && post.is_nsfw

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.url} alt={post.title} className={`w-full rounded-xl ${blurred ? 'blur-md' : ''}`} />
        {blurred && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-xl">
            NSFW tartalom
          </div>
        )}
      </div>
      <h1 className="text-xl font-semibold">{post.title}</h1>
      {post.description && <p>{post.description}</p>}
      {post.prompt && <PromptBox text={post.prompt} lines={10} />}
      {post.tags && <p className="text-sm text-muted-foreground">{post.tags}</p>}
      <p className="text-sm text-muted-foreground">Készítette: {post.author}</p>
      {guest && (
        <button className="w-full rounded-md bg-amber-500 text-white py-2">
          🔓 További funkciókért jelentkezz be
        </button>
      )}
      <div className="flex gap-4 pt-2">
        <a
          href={`https://twitter.com/intent/tweet?url=https://yumekai.com/post/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Twitter
        </a>
        <a
          href={`https://www.reddit.com/submit?url=https://yumekai.com/post/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Reddit
        </a>
      </div>
    </main>
  )
}
