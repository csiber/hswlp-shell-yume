"use client"
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

interface Submission {
  id: string
  file_url: string
  is_approved: boolean
  user_id: string
  nickname: string
  score: number
}

interface Item {
  id: string
  prompt: string
  style: string
  offered_credits: number
  extra_reward_credits: number
  status: string
  request_category: 'standard' | 'challenge'
  voting_mode: 'jury' | 'community'
  deadline: string | null
  total_votes: number
  voting_state: string
  participants: { user_id: string; nickname: string }[]
  submissions: Submission[]
}

const fetcher = (url:string) => fetch(url).then(res => res.json() as Promise<{ items: Item[] }>)

export default function MyRequestsClient() {
  const { data, mutate } = useSWR('/api/my-requests', fetcher)
  const [autoClosing, setAutoClosing] = useState<string | null>(null)

  const approve = async (reqId: string, subId: string) => {
    const res = await fetch(`/api/requests/${reqId}/approve/${subId}`, { method: 'POST' })
    if (res.ok) {
      toast.success('Beküldés jóváhagyva')
      mutate()
    } else {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(body?.error || 'Hiba történt a jóváhagyáskor')
    }
  }

  const finalizeByVotes = async (reqId: string) => {
    setAutoClosing(reqId)
    try {
      const res = await fetch(`/api/requests/${reqId}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'auto' }),
      })
      if (res.ok) {
        toast.success('A közösségi szavazás alapján kiválasztottad a győztest!')
        mutate()
      } else {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        toast.error(body?.error || 'Nem sikerült lezárni a kihívást')
      }
    } finally {
      setAutoClosing(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {data?.items?.length ? (
        data.items.map(it => (
          <div key={it.id} className="border p-3 rounded space-y-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-lg">{it.prompt}</p>
              <p className="text-sm text-muted-foreground">
                {it.style} – alap jutalom: {it.offered_credits} kredit{it.extra_reward_credits ? ` + extra ${it.extra_reward_credits}` : ''}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Állapot: {it.voting_state}</p>
              {it.deadline && <p className="text-xs text-muted-foreground">Határidő: <Countdown deadline={it.deadline} /></p>}
            </div>
            {it.request_category === 'challenge' && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Szavazás módja:</span> {it.voting_mode === 'community' ? 'közösségi' : 'zsűri'}</p>
                <p><span className="font-medium">Összes szavazat:</span> {it.total_votes}</p>
                <p><span className="font-medium">Résztvevők:</span> {it.participants.length ? it.participants.map(p => p.nickname).join(', ') : 'nincs még nevező'}</p>
                {it.voting_mode === 'community' && it.submissions.length > 0 && it.status !== 'fulfilled' && (
                  <Button size="sm" variant="outline" disabled={autoClosing === it.id} onClick={() => finalizeByVotes(it.id)}>
                    {autoClosing === it.id ? 'Lezárás...' : 'Lezárás a közösség döntése alapján'}
                  </Button>
                )}
              </div>
            )}
            {it.status !== 'fulfilled' && (
              <Submissions requestId={it.id} onApprove={approve} />
            )}
          </div>
        ))
      ) : (
        <p>Nincs még saját kérésed.</p>
      )}
    </div>
  )
}

const fetchSubmissions = (url: string) => fetch(url).then(res => res.json() as Promise<{ items: Submission[] }>)

function Submissions({ requestId, onApprove }: { requestId: string; onApprove: (r: string, s: string) => void }) {
  const { data } = useSWR<{ items: Submission[] }>(`/api/my-requests/${requestId}`, fetchSubmissions)
  useEffect(() => {
    // only to trigger re-render when data changes
  }, [data?.items?.length])
  if (!data?.items?.length) return null
  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm">Beküldések:</p>
      {data.items.map(s => (
        <div key={s.id} className="flex flex-col gap-2 border p-2 rounded">
          <div className="flex justify-between text-sm">
            <span>{s.nickname} – {s.file_url}</span>
            <span className="font-semibold">{s.score} pont</span>
          </div>
          {!s.is_approved && (
            <Button size="sm" onClick={() => onApprove(requestId, s.id)}>Győztesnek jelölöm</Button>
          )}
        </div>
      ))}
    </div>
  )
}

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  const deadlineTime = new Date(deadline).getTime()
  if (Number.isNaN(deadlineTime)) return <span>ismeretlen</span>
  const diff = deadlineTime - now
  if (diff <= 0) return <span>lejárt</span>
  const seconds = Math.floor(diff / 1000) % 60
  const minutes = Math.floor(diff / (1000 * 60)) % 60
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const parts: string[] = []
  if (days > 0) parts.push(`${days} nap`)
  if (hours > 0) parts.push(`${hours} óra`)
  parts.push(`${minutes} perc`)
  parts.push(`${seconds} mp`)
  return <span>{parts.join(' ')}</span>
}
