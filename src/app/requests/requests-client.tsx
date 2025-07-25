"use client"
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface RequestItem {
  id: string
  prompt: string
  type: string
  style: string
  offered_credits: number
  nickname: string
  created_at: string
}

export default function RequestsClient() {
  const [tab, setTab] = useState<'new' | 'list'>('new')
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<'image' | 'music'>('image')
  const [style, setStyle] = useState('')
  const [credits, setCredits] = useState(1)
  const [items, setItems] = useState<RequestItem[]>([])

  const banned = /(loli|shota|hentai|rape|guro|nude|sexual|porn|fuck|pussy|underage|bdsm|nsfw|abuse|boob|tits|cum)/i

  useEffect(() => {
    if (tab === 'list') {
      fetch('/api/requests')
        .then(res => res.json() as Promise<{ items: RequestItem[] }>)
        .then(data => setItems(data.items))
        .catch(() => setItems([]))
    }
  }, [tab])

  const submit = async () => {
    if (!prompt.trim() || !style.trim()) return
    if (banned.test(prompt) || banned.test(style)) {
      toast.error('Ez a tartalom nem megengedett a Yumekai rendszerben.')
      return
    }
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type, style, offered_credits: credits })
    })
    if (res.ok) {
      toast.success('Kérés leadva')
      setPrompt('')
      setStyle('')
    } else {
      const data = await res.json().catch(() => null)
      toast.error(data?.error || 'Hiba történt')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex gap-4">
        <Button variant={tab === 'new' ? 'default' : 'outline'} onClick={() => setTab('new')}>Adj le kérést</Button>
        <Button variant={tab === 'list' ? 'default' : 'outline'} onClick={() => setTab('list')}>Teljesíthető kérések</Button>
      </div>
      {tab === 'new' && (
        <div className="space-y-4">
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Prompt" />
          <div className="flex gap-2">
            <select value={type} onChange={e => setType(e.target.value as 'image' | 'music')} className="border px-2 py-1 rounded">
              <option value="image">kép</option>
              <option value="music">zene</option>
            </select>
            <Input value={style} onChange={e => setStyle(e.target.value)} placeholder="Stílus" />
            <Input type="number" value={credits} onChange={e => setCredits(Number(e.target.value))} className="w-24" />
          </div>
          <Button onClick={submit}>Kérés beküldése</Button>
        </div>
      )}
      {tab === 'list' && (
        <div className="space-y-4">
          {items.map(it => (
            <div key={it.id} className="border p-2 rounded">
              <p className="font-medium">{it.prompt}</p>
              <p className="text-sm text-muted-foreground">{it.style} – {it.offered_credits} kredit – {it.nickname}</p>
            </div>
          ))}
          {items.length === 0 && <p>Nincs nyitott kérés.</p>}
        </div>
      )}
    </div>
  )
}
