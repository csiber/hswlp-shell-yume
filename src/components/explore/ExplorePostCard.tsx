"use client"

import NsfwImage from '@/components/ui/NsfwImage'
import ImageLightbox from '@/components/ui/ImageLightbox'

export interface ExploreItem {
  id: string
  title: string | null
  url: string
  author: string
  is_nsfw: boolean
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
      <div className="block border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
        <NsfwImage
          src={item.url}
          alt={item.title || ''}
          blurred={item.is_nsfw && isGuest}
          className="w-full h-48 object-cover"
        />
        <div className="p-2 space-y-1">
          {item.title && <h3 className="text-sm font-semibold truncate">{item.title}</h3>}
          <p className="text-xs text-muted-foreground">{item.author}</p>
        </div>
      </div>
    </ImageLightbox>
  )
}
