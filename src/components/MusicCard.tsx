"use client"

import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Download, Trash } from 'lucide-react'
import { formatTitle, guessMetaFromFilename } from '@/utils/music'

const PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFElEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='

interface MusicCardProps {
  id: string
  url: string
  title: string
  onDownload: () => void
  onDelete: () => void
  editTrigger?: React.ReactNode
}

interface MusicMeta {
  title: string | null
  artist: string | null
  album: string | null
  picture: string | null
}

export default function MusicCard({ id, url, title, onDownload, onDelete, editTrigger }: MusicCardProps) {
  const { data } = useSWR<MusicMeta | null>(
    `/api/music-meta?id=${id}`,
    (u: string): Promise<MusicMeta | null> =>
      fetch(u).then(res => (res.ok ? (res.json() as Promise<MusicMeta>) : null))
  )

  const fallback = guessMetaFromFilename(title)
  const displayTitle = formatTitle(data?.title || fallback.title)
  const displayArtist = data?.artist || fallback.artist

  return (
    <div className="border-2 border-yellow-400 rounded-md p-3 flex flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data?.picture || PLACEHOLDER}
        alt={displayTitle}
        className="object-cover rounded-md relative w-full h-40"
      />
      <div className="text-sm font-semibold truncate">{displayTitle}</div>
      {displayArtist && (
        <div className="text-xs text-muted-foreground truncate">{displayArtist}</div>
      )}
      <audio controls src={url} className="w-full" />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={onDownload}>
          <Download className="w-4 h-4" />
        </Button>
        {editTrigger}
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
