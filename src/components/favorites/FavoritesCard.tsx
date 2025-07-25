"use client"
import { Heart } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import useSWR from 'swr'

interface MusicMeta {
  picture: string | null
}

const PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFElEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='

export interface FavoriteItem {
  id: string
  title: string
  category: 'image' | 'music' | 'prompt'
  mime: string | null
  url: string
}

export default function FavoritesCard({ item, onRemove }: { item: FavoriteItem; onRemove: () => void }) {
  const { data } = useSWR<MusicMeta | null>(
    item.mime?.startsWith('audio/') ? `/api/music-meta?id=${item.id}` : null,
    (u: string): Promise<MusicMeta | null> =>
      fetch(u).then(res => (res.ok ? (res.json() as Promise<MusicMeta>) : null))
  )

  return (
    <div className="favorites-card relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-transform hover:scale-105 bg-background/50">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 z-10 rounded-full bg-white/70 p-1 backdrop-blur hover:bg-white"
            >
              <Heart className="w-5 h-5 text-red-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>You liked this item</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {item.mime?.startsWith('image/') && (
        <ImageLightbox src={item.url} alt={item.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.title} className="h-48 w-full object-cover" />
        </ImageLightbox>
      )}
      {item.mime?.startsWith('audio/') && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data?.picture || PLACEHOLDER}
            alt={item.title}
            className="h-48 w-full object-cover"
          />
          <audio controls src={item.url} className="w-full" />
        </>
      )}
      {item.mime === 'text/plain' && (
        <div className="p-3 text-sm whitespace-pre-wrap max-h-48 overflow-auto">{item.title}</div>
      )}
      <div className="p-2 text-sm font-medium truncate">{item.title}</div>
    </div>
  )
}
