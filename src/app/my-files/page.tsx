// src/app/my-files/page.tsx

'use client'

import useSWR from 'swr'
import { useState, useEffect } from 'react'
interface UploadItem {
  id: string
  category: 'image' | 'music' | 'prompt'
  mime: string | null
  title: string
  description?: string | null
  tags?: string | null
  note?: string | null
  url: string
  download_points: number
  approved: number
}
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ImageLightbox from '@/components/ui/ImageLightbox'
import Image from 'next/image'
import MusicCard from '@/components/MusicCard'
import EditUploadDialog from '@/components/myfiles/EditUploadDialog'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import { useSessionStore } from '@/state/session'
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


export default function MyFilesPage() {
  const [filter, setFilter] = useState<string | null>(null)
  const [showApprovedNotice, setShowApprovedNotice] = useState(false)
  const query = filter ? `?type=${filter}` : ''
  const fetcher = (url: string) =>
    fetch(url).then((res) => res.json() as Promise<{ items: UploadItem[] }>)

  const { data, mutate } = useSWR<{ items: UploadItem[] }>(
    `/api/my-files${query}`,
    fetcher
  )

  const [downloaded, setDownloaded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('downloaded_files')
    if (stored) {
      setDownloaded(new Set(JSON.parse(stored)))
    }
  }, [])

  const markDownloaded = (id: string) => {
    setDownloaded(prev => {
      const ns = new Set(prev)
      ns.add(id)
      localStorage.setItem('downloaded_files', JSON.stringify(Array.from(ns)))
      return ns
    })
  }
  const userCredits = useSessionStore((s) => s.session?.user?.currentCredits ?? 0)
  const fetchSession = useSessionStore((s) => s.fetchSession)

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
    if (userCredits < item.download_points) {
      toast.error('Nincs elég kredit a letöltéshez')
      return
    }
    try {
      const creditRes = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: item.download_points, description: 'File download' }),
      })

      if (!creditRes.ok) {
        toast.error('Nincs elég kredit a letöltéshez')
        return
      }

      fetchSession?.()

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
        markDownloaded(item.id)
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data?.items?.map((item) =>
          item.mime?.startsWith('audio/') ? (
            <div
              key={item.id}
              className={cn(
                'relative',
                !item.approved && 'ring-2 ring-yellow-500 rounded-md'
              )}
            >
              {!item.approved && (
                <span className="absolute top-2 right-2 rounded bg-yellow-500 px-2 py-0.5 text-xs font-medium text-black">
                  Moderációra vár
                </span>
              )}
              <MusicCard
                id={item.id}
                url={item.url}
                title={item.title}
                onDownload={() => downloadFile(item)}
                onDelete={() => deleteFile(item.id)}
                editTrigger={
                  <EditUploadDialog
                    upload={item}
                    onSaved={mutate}
                    trigger={<Button variant="ghost" size="icon">✏️</Button>}
                  />
                }
              />
              {item.tags && (
                <div className="px-1 pt-1 text-xs text-muted-foreground">
                  {item.tags}
                </div>
              )}
            </div>
          ) : (
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
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md relative">
                    <Image src={item.url} alt={item.title} fill className="object-cover" />
                  </div>
                </ImageLightbox>
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
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => downloadFile(item)}
                        disabled={userCredits < item.download_points || downloaded.has(item.id)}
                      >
                        {downloaded.has(item.id) ? (
                          'Letöltve'
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {downloaded.has(item.id)
                        ? 'Már letöltve'
                        : userCredits < item.download_points
                        ? 'Nincs elég kredit a letöltéshez'
                        : `Letöltés ${item.download_points} pontért`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <EditUploadDialog
                  upload={item}
                  onSaved={mutate}
                  trigger={
                    <Button size="icon" variant="ghost">
                      ✏️
                    </Button>
                  }
                />
                <Button size="icon" variant="ghost" onClick={() => deleteFile(item.id)}>
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            {item.tags && (
              <div className="px-2 pb-2 text-xs text-muted-foreground">
                {item.tags}
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  )
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
