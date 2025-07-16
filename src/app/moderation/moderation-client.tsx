"use client"
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UploadItem {
  id: string
  title: string
  type: 'image' | 'music' | 'prompt'
  url: string
}

export default function ModerationClient() {
  const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<{ items: UploadItem[] }>)
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {data?.items?.map(item => (
        <div key={item.id} className="border rounded-md overflow-hidden">
          {item.type === 'image' ? (
            <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
          ) : item.type === 'music' ? (
            <audio src={item.url} controls className="w-full" />
          ) : (
            <iframe src={item.url} className="w-full h-32" title={item.title} />
          )}
          <div className="p-2 flex justify-between items-center">
            <span className="text-sm">{item.title}</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => approve(item.id)} className="bg-green-500 hover:bg-green-600 text-white">✅</Button>
              <Button size="sm" variant="destructive" onClick={() => reject(item.id)}>❌</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
