// src/app/my-files/page.tsx

'use client'

import useSWR from 'swr'
import { useState, useRef } from 'react'
interface UploadItem {
  id: string
  category: 'image' | 'music' | 'prompt'
  mime: string | null
  title: string
  url: string
  download_points: number
}
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  const audioRef = useRef<HTMLAudioElement>(null)
  const query = filter ? `?type=${filter}` : ''
  const fetcher = (url: string) =>
    fetch(url).then((res) => res.json() as Promise<{ items: UploadItem[] }>)

  const { data, mutate } = useSWR<{ items: UploadItem[] }>(
    `/api/my-files${query}`,
    fetcher
  )

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
      <div className="mb-4 flex gap-3">
        <Button variant={filter === null ? 'default' : 'outline'} onClick={() => setFilter(null)}>Összes</Button>
        <Button variant={filter === 'image' ? 'default' : 'outline'} onClick={() => setFilter('image')}>Képek</Button>
        <Button variant={filter === 'music' ? 'default' : 'outline'} onClick={() => setFilter('music')}>Zenék</Button>
        <Button variant={filter === 'prompt' ? 'default' : 'outline'} onClick={() => setFilter('prompt')}>Promptek</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data?.items?.map((item) => {
          const isImage = item.mime?.startsWith('image/')
          const isAudio = item.mime?.startsWith('audio/')
          const isVideo = item.mime?.startsWith('video/')
          const isText = item.mime === 'text/plain'

          const icon = isImage
            ? <ImageIcon className="w-4 h-4" />
            : isAudio
            ? <Music className="w-4 h-4" />
            : isVideo
            ? <VideoIcon className="w-4 h-4" />
            : isText
            ? <FileText className="w-4 h-4" />
            : <FileIcon className="w-4 h-4" />

          return (
            <Card key={item.id} className="overflow-hidden shadow rounded">
              {isImage && (
                <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
              )}
              {isAudio && (
                <div className="p-2">
                  <MusicPlayer
                    id={item.id}
                    url={item.url}
                    title={item.title}
                    audioRef={audioRef}
                    playingId={playingId}
                    setPlayingId={setPlayingId}
                  />
                </div>
              )}
              {isVideo && (
                <video src={item.url} controls className="w-full h-48 object-cover" />
              )}
              <div className="p-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {icon}
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
          )
        })}
      </div>
      <audio ref={audioRef} hidden />
    </main>
  )
}
