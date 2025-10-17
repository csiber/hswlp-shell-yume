"use client"

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import ExplorePostCard, { ExploreItem } from './ExplorePostCard'
import EmptyState from '@/components/favorites/EmptyState'
import { ImageOff } from 'lucide-react'
import { useSessionStore } from '@/state/session'
import ShareButtons from '@/components/share-buttons'
import { format } from 'date-fns'

interface ExploreSection {
  id: string
  slug: string
  title: string
  description: string | null
  activeFrom: string | null
  activeTo: string | null
  displayOrder: number
  items: ExploreItem[]
}

interface ExploreResponse {
  sections?: ExploreSection[]
  feed?: {
    items: ExploreItem[]
    page: number
    limit: number
    hasMore: boolean
  }
}

export default function ExploreClient({ endpoint = '/api/explore' }: { endpoint?: string } = {}) {
  const [items, setItems] = useState<ExploreItem[]>([])
  const [sections, setSections] = useState<ExploreSection[]>([])
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

  const formatDateTime = (value: string | null) => {
    if (!value) return null
    try {
      return format(new Date(value), 'yyyy.MM.dd HH:mm')
    } catch {
      return null
    }
  }

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
          const data = (await res.json()) as ExploreResponse

          if (page === 1 && Array.isArray(data.sections)) {
            setSections(
              [...data.sections].sort(
                (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title),
              ),
            )
          } else if (Array.isArray(data.sections) && data.sections.length > 0) {
            setSections(prev => {
              const map = new Map(prev.map(section => [section.id, section]))
              data.sections?.forEach(section => {
                map.set(section.id, section)
              })
              return Array.from(map.values()).sort(
                (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title),
              )
            })
          }

          const feedItems = data.feed?.items ?? []
          const shuffled = feedItems.sort(() => Math.random() - 0.5)
          setItems(prev => (page === 1 ? shuffled : [...prev, ...shuffled]))
          if (!data.feed?.hasMore || feedItems.length === 0) setHasMore(false)
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

  if (!loading && items.length === 0 && sections.every(section => section.items.length === 0)) {
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
        {sections.map(section => (
          <section key={section.id} className="space-y-3">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  {section.description && (
                    <p className="text-sm text-muted-foreground max-w-2xl">{section.description}</p>
                  )}
                </div>
                {(section.activeFrom || section.activeTo) && (
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const from = formatDateTime(section.activeFrom)
                      const to = formatDateTime(section.activeTo)
                      if (from && to) return `Aktív: ${from} – ${to}`
                      if (from) return `Aktív ettől: ${from}`
                      if (to) return `Aktív eddig: ${to}`
                      return null
                    })()}
                  </p>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, idx) => (
                  <ExplorePostCard
                    key={`${section.id}-${item.id}`}
                    item={item}
                    isGuest={guest}
                    images={section.items}
                    index={idx}
                    baseUrl={baseUrl}
                  />
                ))}
                {section.items.length === 0 && (
                  <div className="text-sm text-muted-foreground col-span-full border border-dashed border-muted-foreground/40 rounded-md p-4">
                    Jelenleg nincs elem ebben a kollekcióban.
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <ExplorePostCard
              key={item.id}
              item={item}
              isGuest={guest}
              images={items}
              index={idx}
              baseUrl={baseUrl}
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
