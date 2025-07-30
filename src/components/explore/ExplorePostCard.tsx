"use client"

import NsfwImage from '@/components/ui/NsfwImage'
import ImageLightbox from '@/components/ui/ImageLightbox'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ShareButtons from '@/components/share-buttons'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

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
  baseUrl: string
}

export default function ExplorePostCard({ item, isGuest = false, images, index, baseUrl }: Props) {
  const gallery = images.map(it => ({
    src: it.url,
    alt: it.title || '',
    title: it.title,
    author: it.author,
  }))
  const shareUrl = `${baseUrl}/post/${item.id}`

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 z-10 bg-black/60 text-white hover:bg-black/70"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-2">
              <ShareButtons title={item.title || 'Untitled'} url={shareUrl} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="p-2 space-y-1">
          {item.title && <h3 className="text-sm font-semibold truncate">{item.title}</h3>}
          <p className="text-xs text-muted-foreground">{item.author}</p>
        </div>
      </div>
    </ImageLightbox>
  )
}
