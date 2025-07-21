'use client'
import useSWR from 'swr'
import FavoritesGrid from '@/components/favorites/FavoritesGrid'
import FavoritesCard, { FavoriteItem } from '@/components/favorites/FavoritesCard'
import EmptyState from '@/components/favorites/EmptyState'
import { HeartCrack } from 'lucide-react'

interface ApiResponse { items: FavoriteItem[] }

export default function FavoritesPage() {
  const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<ApiResponse>)
  const { data, mutate } = useSWR<ApiResponse>('/api/favorites', fetcher)

  async function removeFavorite(id: string) {
    try {
      const res = await fetch('/api/favorite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_id: id }),
      })
      if (res.ok) mutate()
    } catch (e) {
      console.error(e)
      // ignore
    }
  }

  if (data && data.items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <EmptyState
          icon={<HeartCrack className="w-8 h-8" />}
          title="Még nincs kedvenced"
          subtitle="Szívecskézz tartalmakat, hogy ide kerüljenek"
        />
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Kedvenceim</h1>
      <FavoritesGrid>
        {data?.items.map(item => (
          <FavoritesCard key={item.id} item={item} onRemove={() => removeFavorite(item.id)} />
        ))}
      </FavoritesGrid>
    </main>
  )
}
