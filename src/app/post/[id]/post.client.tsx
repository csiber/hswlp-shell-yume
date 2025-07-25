"use client"

import useSWR from 'swr'
import { useSessionStore } from '@/state/session'
import PromptBox from '@/components/community/PromptBox'
import NsfwImage from '@/components/ui/NsfwImage'

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
      <NsfwImage
        src={post.url}
        alt={post.title}
        blurred={blurred}
        className="w-full rounded-xl"
      />
      {blurred && (
        <div className="text-center text-sm bg-red-100 dark:bg-red-800 dark:text-red-100 text-red-800 p-2 rounded">
          Ez a tartalom érzékeny lehet. Belépés után teljes felbontásban megtekinthető.
        </div>
      )}
      <h1 className="text-xl font-semibold">{post.title}</h1>
      {post.description && <p>{post.description}</p>}
      {post.prompt && <PromptBox text={post.prompt} lines={10} />}
      {post.tags && <p className="text-sm text-muted-foreground">{post.tags}</p>}
      <p className="text-sm text-muted-foreground">Készítette: {post.author}</p>
      {guest && (
        <div className="w-full rounded-md bg-amber-500 text-white text-center py-2">
          🔓 További funkciókért jelentkezz be vagy regisztrálj
        </div>
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
