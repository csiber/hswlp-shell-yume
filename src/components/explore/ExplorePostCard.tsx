"use client"

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
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.title || ''} className={`w-full h-48 object-cover ${item.is_nsfw && isGuest ? 'blur-sm' : ''}`} />
        {item.is_nsfw && isGuest && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            NSFW tartalom
          </div>
        )}
      </div>
      <div className="p-2 space-y-1">
        {item.title && <h3 className="text-sm font-semibold truncate">{item.title}</h3>}
        <p className="text-xs text-muted-foreground">{item.author}</p>
      </div>
    </a>
  )
}
