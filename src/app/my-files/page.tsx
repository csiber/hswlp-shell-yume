// src/app/my-files/page.tsx

'use client'

import useSWR from 'swr'
import { useState, useRef, useEffect } from 'react'
interface UploadItem {
  id: string
  category: 'image' | 'music' | 'prompt'
  mime: string | null
  title: string
  url: string
  download_points: number
  approved: number
}
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import {
  Download,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Trash,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import MusicPlayer from '@/components/community/MusicPlayer'

export default function MyFilesPage() {
  const [filter, setFilter] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showApprovedNotice, setShowApprovedNotice] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const query = filter ? `?type=${filter}` : ''
  const fetcher = (url: string) =>
    fetch(url).then((res) => res.json() as Promise<{ items: UploadItem[] }>)

  const { data, mutate } = useSWR<{ items: UploadItem[] }>(
    `/api/my-files${query}`,
    fetcher
  )

  useEffect(() => {
    if (!data?.items) return
    const newlyApproved = data.items.some(
      (it) => it.approved === 1 && !localStorage.getItem(`approved_${it.id}`)
    )
    if (newlyApproved) {
      setShowApprovedNotice(true)
      data.items.forEach((it) => {
        if (it.approved === 1) {
          localStorage.setItem(`approved_${it.id}`, '1')
        }
      })
    }
  }, [data])

  const deleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/my-files/${id}/delete`, { method: 'POST' })
      if (res.ok) {
        toast.success('Fájl törölve')
        mutate()
      } else {
        toast.error('Hiba történt törlés közben')
      }
    } catch {
      toast.error('Hálózati hiba történt')
    }
  }

  const downloadFile = async (item: UploadItem) => {
    try {
      const res = await fetch(`/api/uploads/${item.id}/download`)
      if (res.ok) {
        toast.success('Letöltés indítása')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = item.title
        a.click()
        URL.revokeObjectURL(url)
      } else if (res.status === 402) {
        toast.error('Nincs elég kredit a letöltéshez')
      } else {
        toast.error('Letöltés sikertelen')
      }
    } catch {
      toast.error('Hálózati hiba történt')
    }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {showApprovedNotice && (
        <div className="mb-4 rounded-md bg-amber-400 text-black p-4 shadow-md animate-fade-in">
          Gratulálunk! Feltöltésed jóvá lett hagyva.
        </div>
      )}
      <div className="mb-4 flex gap-3">
        <Button variant={filter === null ? 'default' : 'outline'} onClick={() => setFilter(null)}>Összes</Button>
        <Button variant={filter === 'image' ? 'default' : 'outline'} onClick={() => setFilter('image')}>Képek</Button>
        <Button variant={filter === 'music' ? 'default' : 'outline'} onClick={() => setFilter('music')}>Zenék</Button>
        <Button variant={filter === 'prompt' ? 'default' : 'outline'} onClick={() => setFilter('prompt')}>Promptek</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.items?.map((item) => (
          <Card
            key={item.id}
            className={cn(
              'relative overflow-hidden shadow rounded',
              !item.approved && 'ring-2 ring-yellow-500'
            )}
          >
            {!item.approved && (
              <span className="absolute top-2 right-2 rounded bg-yellow-500 px-2 py-0.5 text-xs font-medium text-black">
                Moderációra vár
              </span>
            )}
            {item.mime?.startsWith('image/') && (
              <ImageLightbox src={item.url} alt={item.title}>
                <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
              </ImageLightbox>
            )}
            {item.mime?.startsWith('audio/') && (
              <MusicPreview
                id={item.id}
                url={item.url}
                title={item.title}
                audioRef={audioRef}
                playingId={playingId}
                setPlayingId={setPlayingId}
              />
            )}
            {item.mime === 'text/plain' && <PromptPreview url={item.url} />}
            {item.mime?.startsWith('video/') && (
              <video src={item.url} controls className="w-full h-48 object-cover" />
            )}
            <div className="p-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {item.mime?.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4" />
                ) : item.mime?.startsWith('audio/') ? (
                  <Music className="w-4 h-4" />
                ) : item.mime?.startsWith('video/') ? (
                  <VideoIcon className="w-4 h-4" />
                ) : item.mime === 'text/plain' ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <FileIcon className="w-4 h-4" />
                )}
                <span className="text-sm truncate" title={item.title}>{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => downloadFile(item)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {`Letöltés ${item.download_points} pontért`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button size="icon" variant="ghost" onClick={() => deleteFile(item.id)}>
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <audio ref={audioRef} hidden />
    </main>
  )
}

interface MusicMeta {
  title: string | null
  artist: string | null
  album: string | null
  picture: string | null
}

function MusicPreview({
  id,
  url,
  title,
  audioRef,
  playingId,
  setPlayingId,
}: {
  id: string
  url: string
  title: string
  audioRef: React.RefObject<HTMLAudioElement | null>
  playingId: string | null
  setPlayingId: (id: string | null) => void
}) {
  const { data } = useSWR<MusicMeta | null>(
    `/api/music-meta?id=${id}`,
    (u: string): Promise<MusicMeta | null> =>
      fetch(u).then((res) => (res.ok ? (res.json() as Promise<MusicMeta>) : null))
  )
  const displayTitle = formatTitle(data?.title || title)
  return (
    <div className="p-2 flex flex-col items-center gap-2 w-full">
      {data?.picture && (
        <img src={data.picture} alt={displayTitle} className="w-full aspect-square object-contain rounded" />
      )}
      <div className="text-center text-sm">
        <h3>{displayTitle}</h3>
        {data?.artist && <p>{data.artist}</p>}
      </div>
      <MusicPlayer
        id={id}
        url={url}
        title={displayTitle}
        audioRef={audioRef}
        playingId={playingId}
        setPlayingId={setPlayingId}
      />
    </div>
  )
}

function formatTitle(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

function PromptPreview({ url }: { url: string }) {
  const { data } = useSWR<string>(url, (u: string) => fetch(u).then((r) => r.text()))
  if (!data) return <div className="text-sm p-2">Betöltés...</div>
  const lines = data.split(/\r?\n/)
  const truncated = lines.slice(0, 20).join('\n')
  const hasMore = lines.length > 20
  return (
    <div className="w-full p-2 flex flex-col items-start">
      <pre className="w-full flex-1 whitespace-pre-wrap text-xs bg-zinc-900 rounded p-2 max-h-40 overflow-y-auto">
        {hasMore ? `${truncated}\n...` : truncated}
      </pre>
      {hasMore && (
        <Button asChild size="sm" className="mt-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Megnyitás
          </a>
        </Button>
      )}
    </div>
  )
}
