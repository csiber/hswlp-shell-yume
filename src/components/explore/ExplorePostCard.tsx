"use client"

import NsfwImage from '@/components/ui/NsfwImage'

export interface ExploreItem {
  id: string
  title: string | null
  url: string
  author: string
  is_nsfw: boolean
}

export default function ExplorePostCard({ item, isGuest = false }: { item: ExploreItem; isGuest?: boolean }) {
  return (
    <a href={`/post/${item.id}`} className="block border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
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
    </a>
  )
}
