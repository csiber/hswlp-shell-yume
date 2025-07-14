import { Card } from '@/components/ui/card'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { useSessionStore } from '@/state/session'
import { useFavorite } from '@/hooks/useFavorite'
import { useState } from 'react'
import CommentBox from './CommentBox'

export interface UploadItem {
  id: string
  type: 'image' | 'music' | 'prompt'
  url: string
  title: string | null
  is_favorited?: boolean
}

function UploadCard({ item }: { item: UploadItem }) {
  const session = useSessionStore((s) => s.session)
  const { favorited, toggle } = useFavorite(item.is_favorited ?? false, item.id)
  const [showComments, setShowComments] = useState(false)

  return (
    <Card className="overflow-hidden relative">
      {session?.user?.id && (
        <button
          onClick={toggle}
          className="absolute right-2 top-2 text-yellow-500"
        >
          {favorited ? (
            <StarSolid className="h-5 w-5" />
          ) : (
            <StarOutline className="h-5 w-5" />
          )}
        </button>
      )}
      {item.type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.title || ''} className="h-48 w-full object-cover" />
      ) : item.type === 'music' ? (
        <audio controls src={item.url} className="w-full" />
      ) : (
        <div className="p-4 text-sm">{item.title}</div>
      )}
      {item.type !== 'prompt' && (
        <div className="p-2 text-sm text-center">{item.title}</div>
      )}
      <div className="p-2">
        <button
          onClick={() => setShowComments((v) => !v)}
          className="mb-2 text-xs text-indigo-500 hover:underline"
        >
          💬 Kommentek
        </button>
        {showComments && (
          <CommentBox uploadId={item.id} currentUserId={session?.user?.id} />
        )}
      </div>
    </Card>
  )
}

export default function UploadGrid({ items }: { items: UploadItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <UploadCard key={item.id} item={item} />
      ))}
    </div>
  )
}
