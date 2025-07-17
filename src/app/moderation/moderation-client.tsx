"use client"
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Check, X, Image as ImageIcon, Music, FileText } from 'lucide-react'

interface UploadItem {
  id: string
  title: string
  type: 'image' | 'music' | 'prompt'
  url: string
}

interface MusicMeta {
  title: string | null
  artist: string | null
  album: string | null
  picture: string | null
}

const fetcher = (url: string) =>
  fetch(url).then(res => res.json() as Promise<{ items: UploadItem[] }>)

export default function ModerationClient() {
  const { data, mutate } = useSWR<{ items: UploadItem[] }>('/api/moderation', fetcher)

  const approve = async (id: string) => {
    const res = await fetch(`/api/moderation/${id}/approve`, { method: 'POST' })
    if (res.ok) {
      toast.success('Jóváhagyva')
      mutate()
    } else toast.error('Hiba történt')
  }

  const reject = async (id: string) => {
    const res = await fetch(`/api/moderation/${id}/reject`, { method: 'POST' })
    if (res.ok) {
      toast.success('Elutasítva')
      mutate()
    } else toast.error('Hiba történt')
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data?.items?.map(item => (
        <ModerationCard
          key={item.id}
          item={item}
          onApprove={() => approve(item.id)}
          onReject={() => reject(item.id)}
        />
      ))}
    </div>
  )
}

function ModerationCard({
  item,
  onApprove,
  onReject,
}: {
  item: UploadItem
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <Card className="relative flex flex-col h-72">
      <span className="absolute top-2 left-2 text-sm opacity-70">
        {item.type === 'image' ? (
          <ImageIcon className="w-4 h-4" />
        ) : item.type === 'music' ? (
          <Music className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
      </span>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {item.type === 'image' && <ImagePreview url={item.url} alt={item.title} />}
        {item.type === 'prompt' && <PromptPreview url={item.url} />}
        {item.type === 'music' && (
          <MusicPreview id={item.id} url={item.url} title={item.title} />
        )}
      </div>
      <div className="mt-auto p-2 flex justify-between items-center gap-2">
        <span className="text-sm truncate" title={item.title}>
          {item.title}
        </span>
        <div className="flex gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={onApprove}
                  className="bg-zinc-800 hover:bg-emerald-600 text-white"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Elfogadás</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={onReject}
                  className="bg-zinc-800 hover:bg-red-600 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Elutasítás</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  )
}

function ImagePreview({ url, alt }: { url: string; alt: string }) {
  return (
    <ImageLightbox src={url} alt={alt}>
      <div className="w-full h-full aspect-square flex items-center justify-center">
        <img src={url} alt={alt} className="object-contain w-full h-full" />
      </div>
    </ImageLightbox>
  )
}

function PromptPreview({ url }: { url: string }) {
  const { data } = useSWR<string>(url, (u: string) => fetch(u).then(r => r.text()))
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

function MusicPreview({ id, url, title }: { id: string; url: string; title: string }) {
  const { data } = useSWR<MusicMeta | null>(
    `/api/music-meta?id=${id}`,
    (u: string): Promise<MusicMeta | null> =>
      fetch(u).then(res => (res.ok ? (res.json() as Promise<MusicMeta>) : null))
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
      <audio src={url} controls className="w-full" />
    </div>
  )
}

function formatTitle(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

