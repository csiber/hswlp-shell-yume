"use client"

import useSWR from 'swr'
import Link from 'next/link'
import { useSessionStore } from '@/state/session'
import PromptBox from '@/components/community/PromptBox'
import NsfwImage from '@/components/ui/NsfwImage'
import ShareButtons from '@/components/share-buttons'
import { Button } from '@/components/ui/button'
import useGuestPostLimiter from '@/hooks/useGuestPostLimiter'

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
  const guest = !session?.user?.id
  const limitReached = useGuestPostLimiter(guest)

  if (!data) return <div className="p-4">Betöltés...</div>
  const { post } = data
  const blurred = guest && post.is_nsfw

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      {limitReached ? (
        <div className="space-y-2 text-center bg-yellow-100 dark:bg-yellow-900 p-4 rounded-md">
          <p>👀 Daily limit reached (30 images/day as a guest).</p>
          <p>🔓 Sign in or register for unlimited browsing!</p>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <NsfwImage
            src={post.url}
            alt={post.title}
            blurred={blurred}
            className="w-full rounded-xl"
          />
          {blurred && (
            <div className="text-center text-sm bg-red-100 dark:bg-red-800 dark:text-red-100 text-red-800 p-2 rounded">
              This content may be sensitive. Sign in to view in full resolution.
            </div>
          )}
        </>
      )}
      <h1 className="text-xl font-semibold">{post.title}</h1>
      {post.description && <p>{post.description}</p>}
      {post.prompt && <PromptBox text={post.prompt} lines={10} />}
      {post.tags && <p className="text-sm text-muted-foreground">{post.tags}</p>}
      <p className="text-sm text-muted-foreground">Created by: {post.author}</p>
      {guest && (
        <div className="w-full rounded-md bg-amber-500 text-white text-center py-2">
          🔓 Sign in or register to unlock more features
        </div>
      )}
      <ShareButtons
        title={post.title}
        url={`${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL ?? ''}/post/${id}`}
        className="fixed right-4 bottom-4 z-20 print:hidden"
        referrerId={session?.user?.id}
      />
    </main>
  )
}
