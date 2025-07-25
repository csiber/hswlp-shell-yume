"use client"

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import ExplorePostCard, { ExploreItem } from './ExplorePostCard'
import EmptyState from '@/components/favorites/EmptyState'
import { ImageOff } from 'lucide-react'

export default function ExploreClient() {
  const [items, setItems] = useState<ExploreItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(p => p + 1)
    }
  }, [inView, hasMore, loading])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/explore?page=${page}`)
        if (res.ok) {
          const data = (await res.json()) as { items: ExploreItem[] }
          setItems(prev => [...prev, ...data.items])
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
  }, [page])

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="w-8 h-8" />}
        title="Nincs publikus poszt"
        subtitle="Jelentkezz be, hogy feltölthess vagy böngéssz további tartalmakat"
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="text-center text-sm bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100 text-yellow-800 p-2 rounded">
        Vendégként böngészed a nyilvános galériát – belépés után több tartalom elérhető.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <ExplorePostCard key={item.id} item={item} />
        ))}
      </div>
      {loading && <p className="text-center">Betöltés...</p>}
      {hasMore && <div ref={ref} className="h-8" />}
    </div>
  )
}
