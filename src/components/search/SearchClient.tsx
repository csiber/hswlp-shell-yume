"use client"

import { useState } from 'react'
import ExplorePostCard, { ExploreItem } from '@/components/explore/ExplorePostCard'

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ExploreItem[]>([])
  const [loading, setLoading] = useState(false)
  const baseUrl = "https://yumekai.app" // vagy derive-old dinamikusan, pl. window.location.origin


  async function search() {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = (await res.json()) as { items: ExploreItem[] }
        setItems(data.items)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <input
          className="border px-3 py-2 rounded flex-1"
          placeholder="Search by title or tag"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded"
          onClick={search}
        >
          Search
        </button>
      </div>
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <ExplorePostCard key={item.id} item={item} images={items} index={idx} isGuest={false} baseUrl={baseUrl} />
        ))}
      </div>
    </div>
  )
}
