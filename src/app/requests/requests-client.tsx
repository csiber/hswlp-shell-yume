"use client"
import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SubmissionSummary {
  id: string
  file_url: string
  nickname: string
  score: number
  user_id: string
  is_approved: boolean
}

interface RequestItem {
  id: string
  prompt: string
  type: string
  style: string
  offered_credits: number
  extra_reward_credits: number
  nickname: string
  created_at: string
  request_category: 'standard' | 'challenge'
  voting_mode: 'jury' | 'community'
  deadline: string | null
  status: string
  participants: { user_id: string; nickname: string }[]
  submissions: SubmissionSummary[]
  total_votes: number
  voting_state: string
  user_vote_submission_id: string | null
}

export default function RequestsClient() {
  const [tab, setTab] = useState<'new' | 'list'>('new')
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<'image' | 'music'>('image')
  const [style, setStyle] = useState('')
  const [credits, setCredits] = useState(1)
  const [requestCategory, setRequestCategory] = useState<'standard' | 'challenge'>('standard')
  const [deadline, setDeadline] = useState('')
  const [extraReward, setExtraReward] = useState(0)
  const [votingMode, setVotingMode] = useState<'jury' | 'community'>('jury')
  const [items, setItems] = useState<RequestItem[]>([])
  const [voteSelections, setVoteSelections] = useState<Record<string, string>>({})
  const [loadingList, setLoadingList] = useState(false)

  const banned = /(loli|shota|hentai|rape|guro|nude|sexual|porn|fuck|pussy|underage|bdsm|nsfw|abuse|boob|tits|cum)/i

  useEffect(() => {
    if (tab === 'list') {
      void loadRequests()
    }
  }, [tab])

  useEffect(() => {
    const initialVotes: Record<string, string> = {}
    for (const req of items) {
      if (req.user_vote_submission_id) {
        initialVotes[req.id] = req.user_vote_submission_id
      }
    }
    setVoteSelections(prev => ({ ...initialVotes, ...prev }))
  }, [items])

  const loadRequests = async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/requests')
      const data = (await res.json()) as { items: RequestItem[] }
      setItems(data.items)
    } catch (err) {
      console.error(err)
      setItems([])
    } finally {
      setLoadingList(false)
    }
  }

  const submit = async () => {
    if (!prompt.trim() || !style.trim()) return
    if (banned.test(prompt) || banned.test(style)) {
      toast.error('Ez a tartalom nem megengedett a Yumekai rendszerben.')
      return
    }
    if (requestCategory === 'challenge' && !deadline) {
      toast.error('A kihívásokhoz adj meg határidőt!')
      return
    }
    const deadlineIso = requestCategory === 'challenge' && deadline ? new Date(deadline).toISOString() : undefined
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        type,
        style,
        offered_credits: credits,
        request_category: requestCategory,
        deadline: deadlineIso,
        extra_reward_credits: requestCategory === 'challenge' ? extraReward : undefined,
        voting_mode: requestCategory === 'challenge' ? votingMode : undefined,
      })
    })
    if (res.ok) {
      toast.success('Request submitted')
      setPrompt('')
      setStyle('')
      setCredits(1)
      setDeadline('')
      setExtraReward(0)
      setRequestCategory('standard')
      setVotingMode('jury')
    } else {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(data?.error || 'An error occurred')
    }
  }

  const accept = async (id: string) => {
    const res = await fetch(`/api/requests/${id}/accept`, { method: 'POST' })
    if (res.ok) {
      toast.success('Request accepted')
      void loadRequests()
    } else {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(data?.error || 'Failed to accept')
    }
  }

  const castVote = async (requestId: string) => {
    const submissionId = voteSelections[requestId]
    if (!submissionId) {
      toast.error('Válassz egy nevezést a szavazáshoz!')
      return
    }
    const res = await fetch(`/api/requests/${requestId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId })
    })
    if (res.ok) {
      toast.success('Szavazat rögzítve')
      void loadRequests()
    } else {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(data?.error || 'Nem sikerült a szavazás')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex gap-4">
        <Button variant={tab === 'new' ? 'default' : 'outline'} onClick={() => setTab('new')}>Új kérés</Button>
        <Button variant={tab === 'list' ? 'default' : 'outline'} onClick={() => setTab('list')}>Elérhető kérések</Button>
      </div>
      {tab === 'new' && (
        <div className="space-y-4">
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Prompt" />
          <div className="flex flex-wrap gap-2">
            <select value={type} onChange={e => setType(e.target.value as 'image' | 'music')} className="border px-2 py-1 rounded">
              <option value="image">image</option>
              <option value="music">music</option>
            </select>
            <Input value={style} onChange={e => setStyle(e.target.value)} placeholder="Stílus" />
            <Input type="number" min={1} value={credits} onChange={e => setCredits(Number(e.target.value))} className="w-24" />
            <select value={requestCategory} onChange={e => setRequestCategory(e.target.value as 'standard' | 'challenge')} className="border px-2 py-1 rounded">
              <option value="standard">standard</option>
              <option value="challenge">challenge</option>
            </select>
            {requestCategory === 'challenge' && (
              <>
                <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
                <Input type="number" min={0} value={extraReward} onChange={e => setExtraReward(Number(e.target.value))} className="w-32" placeholder="Extra kreditek" />
                <select value={votingMode} onChange={e => setVotingMode(e.target.value as 'jury' | 'community')} className="border px-2 py-1 rounded">
                  <option value="jury">zsűri</option>
                  <option value="community">közösségi</option>
                </select>
              </>
            )}
          </div>
          <Button onClick={submit}>Mentés</Button>
        </div>
      )}
      {tab === 'list' && (
        <div className="space-y-4">
          {loadingList && <p>Betöltés...</p>}
          {items.map(it => (
            <div key={it.id} className="border p-3 rounded space-y-3">
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">{it.prompt}</p>
                <p className="text-sm text-muted-foreground">
                  {it.style} – alap jutalom: {it.offered_credits} kredit{it.extra_reward_credits ? ` + extra ${it.extra_reward_credits}` : ''} – {it.nickname}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Állapot: {it.voting_state}</p>
              </div>
              {it.request_category === 'challenge' ? (
                <ChallengeDetails
                  request={it}
                  voteSelection={voteSelections[it.id] || ''}
                  onVoteSelectionChange={(value) => setVoteSelections(prev => ({ ...prev, [it.id]: value }))}
                  onVote={() => castVote(it.id)}
                />
              ) : (
                <Button size="sm" onClick={() => accept(it.id)}>Elfogadom</Button>
              )}
            </div>
          ))}
          {!loadingList && items.length === 0 && <p>Nincs jelenleg elérhető kérés.</p>}
        </div>
      )}
    </div>
  )
}

function ChallengeDetails({
  request,
  voteSelection,
  onVoteSelectionChange,
  onVote,
}: {
  request: RequestItem
  voteSelection: string
  onVoteSelectionChange: (value: string) => void
  onVote: () => void
}) {
  const sortedSubmissions = useMemo(() => request.submissions ?? [], [request.submissions])
  const hasEntries = sortedSubmissions.length > 0
  const votingEnabled = request.voting_mode === 'community'
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>Lejárat: {request.deadline ? <Countdown deadline={request.deadline} /> : 'nincs megadva'}</span>
        <span>Szavazás módja: {request.voting_mode === 'community' ? 'közösségi' : 'zsűri'}</span>
        <span>Összes szavazat: {request.total_votes}</span>
      </div>
      <div>
        <p className="font-semibold text-sm">Résztvevők:</p>
        {request.participants.length ? (
          <p className="text-sm">{request.participants.map(p => p.nickname).join(', ')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Még nincs nevezés.</p>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm">Toplista:</p>
        {hasEntries ? (
          <ul className="space-y-1 text-sm">
            {sortedSubmissions.map(sub => (
              <li key={sub.id} className={`flex justify-between rounded px-2 py-1 ${sub.is_approved ? 'bg-emerald-50' : 'bg-muted/30'}`}>
                <span>{sub.nickname} – {sub.file_url}</span>
                <span className="font-semibold">{sub.score} pont</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nincs még toplista.</p>
        )}
      </div>
      {votingEnabled && hasEntries && (
        <div className="flex flex-wrap items-center gap-2">
          <select value={voteSelection} onChange={e => onVoteSelectionChange(e.target.value)} className="border px-2 py-1 rounded">
            <option value="">Válassz nevezést</option>
            {sortedSubmissions.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nickname} – {sub.file_url}</option>
            ))}
          </select>
          <Button size="sm" onClick={onVote}>Szavazok</Button>
        </div>
      )}
      {!votingEnabled && <p className="text-xs text-muted-foreground">A győztest a zsűri (request tulajdonosa) választja ki.</p>}
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
