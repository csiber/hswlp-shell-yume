"use client"
import { Heart } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import WatermarkedImage from '@/components/ui/WatermarkedImage'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import useSWR from 'swr'
import { motion } from 'framer-motion'

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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="favorites-card relative overflow-hidden rounded-2xl shadow-md bg-background/50"
    >
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
          <div className="relative aspect-square">
            <WatermarkedImage
              src={item.url}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
        </ImageLightbox>
      )}
      {item.mime?.startsWith('audio/') && (
        <>
          <div className="relative aspect-square">
            <WatermarkedImage
              src={data?.picture || PLACEHOLDER}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
          <audio controls src={item.url} className="w-full mt-2" />
        </>
      )}
      {item.mime === 'text/plain' && (
        <div className="p-3 text-sm whitespace-pre-wrap max-h-48 overflow-auto">{item.title}</div>
      )}
      <div className="p-2 text-sm font-medium truncate">{item.title}</div>
    </motion.div>
  )
}
