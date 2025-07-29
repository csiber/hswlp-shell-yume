"use client"

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import ExplorePostCard, { ExploreItem } from './ExplorePostCard'
import EmptyState from '@/components/favorites/EmptyState'
import { ImageOff } from 'lucide-react'
import { useSessionStore } from '@/state/session'
import ShareButtons from '@/components/share-buttons'

export default function ExploreClient({ endpoint = '/api/explore' }: { endpoint?: string } = {}) {
  const [items, setItems] = useState<ExploreItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { ref, inView } = useInView()
  const session = useSessionStore(s => s.session)
  const guest = !session?.user?.id
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ?? ''

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(p => p + 1)
    }
  }, [inView, hasMore, loading])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${endpoint}?page=${page}`)
        if (res.ok) {
          const data = (await res.json()) as { items: ExploreItem[] }
          const shuffled = data.items.sort(() => Math.random() - 0.5)
          setItems(prev => [...prev, ...shuffled])
          if (data.items.length === 0) setHasMore(false)
        } else {
          setHasMore(false)
        }
      } catch {
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, endpoint])

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="w-8 h-8" />}
        title="No public posts"
        subtitle="Sign in to upload or browse more content"
      />
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {guest && (
          <div className="text-center text-sm bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100 text-yellow-800 p-2 rounded">
            🔓 Sign in or register to unlock more features
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <ExplorePostCard
              key={item.id}
              item={item}
              isGuest={guest}
              images={items}
              index={idx}
            />
          ))}
        </div>
        {loading && <p className="text-center">Loading...</p>}
        {hasMore && <div ref={ref} className="h-8" />}
      </div>
      <ShareButtons
        title="Explore Yumekai AI Gallery"
        url={`${baseUrl}/explore`}
        className="fixed right-4 bottom-4 z-20 print:hidden"
        referrerId={session?.user?.id}
      />
    </>
  )
}
