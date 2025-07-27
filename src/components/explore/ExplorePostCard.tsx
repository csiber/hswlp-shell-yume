"use client"

import NsfwImage from '@/components/ui/NsfwImage'
import ImageLightbox from '@/components/ui/ImageLightbox'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

export interface ExploreItem {
  id: string
  title: string | null
  url: string
  author: string
  is_nsfw: boolean
  y?: boolean
}

interface Props {
  item: ExploreItem
  isGuest?: boolean
  images: ExploreItem[]
  index: number
}

export default function ExplorePostCard({ item, isGuest = false, images, index }: Props) {
  const gallery = images.map(it => ({
    src: it.url,
    alt: it.title || '',
    title: it.title,
    author: it.author,
  }))

  return (
    <ImageLightbox src={item.url} alt={item.title || ''} images={gallery} index={index}>
      <div className="block border rounded-xl overflow-hidden shadow transition-transform hover:scale-105 hover:shadow-lg">
        <div className="relative aspect-[2/3]">
          <NsfwImage
            src={item.url}
            alt={item.title || ''}
            blurred={item.is_nsfw && isGuest}
            className="object-cover w-full h-full"
          />
          {item.y && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">Y</span>
                </TooltipTrigger>
                <TooltipContent>Yumekai pick</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="p-2 space-y-1">
          {item.title && <h3 className="text-sm font-semibold truncate">{item.title}</h3>}
          <p className="text-xs text-muted-foreground">{item.author}</p>
        </div>
      </div>
    </ImageLightbox>
  )
}
