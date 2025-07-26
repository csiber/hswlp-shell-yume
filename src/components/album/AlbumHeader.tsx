"use client"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/hu'
import { useSessionStore } from '@/state/session'

dayjs.extend(relativeTime)
dayjs.locale('hu')

export interface AlbumInfo {
  id: string
  name: string
  user_id: string
  created_at: string
  fileCount: number
  author?: string | null
}

export default function AlbumHeader({ album }: { album: AlbumInfo }) {
  const session = useSessionStore(s => s.session)
  const isOwner = session?.user?.id === album.user_id
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{album.name}</h1>
      <p className="text-sm text-muted-foreground">
        {isOwner ? 'Your album' : album.author || 'Unknown user'} ·{' '}
        {dayjs(album.created_at).fromNow()} · {album.fileCount} images
      </p>
    </div>
  )
}
