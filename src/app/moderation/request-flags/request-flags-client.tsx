"use client"
import useSWR from 'swr'
import { Card } from '@/components/ui/card'

interface FlagItem { id: string; user_id: string; prompt: string; created_at: string }
const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<{ items: FlagItem[] }>)

export default function FlaggedClient() {
  const { data } = useSWR('/api/admin/request-flagged-attempts', fetcher)
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2">
      {data?.items?.length ? (
        data.items.map(it => (
          <Card key={it.id} className="p-2">
            <p className="text-sm">{it.prompt}</p>
            <p className="text-xs text-muted-foreground">{it.user_id} – {new Date(it.created_at).toLocaleString()}</p>
          </Card>
        ))
      ) : (
        <p>Nincs naplózott próbálkozás.</p>
      )}
    </div>
  )
}
