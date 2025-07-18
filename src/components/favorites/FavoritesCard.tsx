"use client"
import Image from 'next/image'
import { Heart } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export interface FavoriteItem {
  id: string
  title: string
  category: 'image' | 'music' | 'prompt'
  mime: string | null
  url: string
}

export default function FavoritesCard({ item, onRemove }: { item: FavoriteItem; onRemove: () => void }) {
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
          <TooltipContent>Ezt a képet szívecskézted</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {item.mime?.startsWith('image/') && (
        <ImageLightbox src={item.url} alt={item.title}>
          <Image src={item.url} alt={item.title} width={400} height={400} className="h-48 w-full object-cover" />
        </ImageLightbox>
      )}
      {item.mime?.startsWith('audio/') && (
        <audio controls src={item.url} className="w-full h-48" />
      )}
      {item.mime === 'text/plain' && (
        <div className="p-3 text-sm whitespace-pre-wrap max-h-48 overflow-auto">{item.title}</div>
      )}
      <div className="p-2 text-sm font-medium truncate">{item.title}</div>
    </div>
  )
}
