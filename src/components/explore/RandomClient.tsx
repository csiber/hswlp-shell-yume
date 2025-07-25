"use client"

import { useEffect, useState } from 'react'
import { useSessionStore } from '@/state/session'
import ExplorePostCard, { ExploreItem } from './ExplorePostCard'
import EmptyState from '@/components/favorites/EmptyState'
import { ImageOff } from 'lucide-react'

export default function RandomClient() {
  const [items, setItems] = useState<ExploreItem[]>([])
  const [loading, setLoading] = useState(true)
  const session = useSessionStore((s) => s.session)
  const guest = !session?.user?.id

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/random')
        if (res.ok) {
          const data = (await res.json()) as { items: ExploreItem[] }
          setItems(data.items)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {guest && (
        <div className="text-center text-sm bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100 text-yellow-800 p-2 rounded">
          🔓 Sign in or register to unlock more features
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ExplorePostCard key={item.id} item={item} isGuest={guest} />
        ))}
      </div>
    </div>
  )
}
