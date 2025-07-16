// src/app/my-files/page.tsx

'use client'

import useSWR from 'swr'
import { useState } from 'react'
interface UploadItem {
  id: string
  type: 'image' | 'music' | 'prompt'
  title: string
  url: string
  download_points: number
}
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function MyFilesPage() {
  const [filter, setFilter] = useState<string | null>(null)
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
        {data?.items?.map((item) => (
          <div key={item.id} className="border rounded-md overflow-hidden">
            {item.type === 'image' ? (
              <img
                src={item.url || '/placeholder.png'}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            ) : item.type === 'music' ? (
              <audio src={item.url} controls className="w-full" />
            ) : (
              <iframe src={item.url} className="w-full h-32" title={item.title} />
            )}
            <div className="p-2 flex justify-between items-center">
              <span className="text-sm">{item.title}</span>
              <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => downloadFile(item)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {`Letöltés ${item.download_points} pontért`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button size="sm" variant="destructive" onClick={() => deleteFile(item.id)}>Törlés</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
