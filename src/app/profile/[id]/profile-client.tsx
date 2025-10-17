"use client"
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { formatCredits } from '@/utils/format-credits'
import { UserMiniCard } from '@/components/user-mini-card'
import { Download, Heart, MessageCircle, TrendingUp } from 'lucide-react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import WatermarkedImage from '@/components/ui/WatermarkedImage'
import StatsCard from '@/components/profile/StatsCard'
import ProgressBar from '@/components/profile/ProgressBar'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts'
import { useMemo } from 'react'

type Upload = {
  id: string
  type: 'image' | 'music' | 'prompt'
  url: string
  name: string
  created_at: string
  download_points: number
}

interface Props {
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
    credits: number
    profileFrameEnabled?: boolean
    points?: number
  }
  uploads: Upload[]
  badges: {
    key: string
    name: string
    description: string
    icon: string
    awarded_at: string
  }[]
  stats: {
    monthlyUploads: { month: string; count: number }[]
    engagement: { totalLikes: number; totalReactions: number }
    points: {
      total: number
      level: number
      currentLevelThreshold: number
      nextLevelThreshold: number | null
      progress: number
      history: { date: string; points: number }[]
    }
  }
  badgeOverview: {
    upcoming: {
      key: string
      name: string
      description: string
      icon: string
    }[]
  }
  currentUserId?: string
}

export default function ProfileClient({ user, uploads, badges, stats, badgeOverview, currentUserId }: Props) {
  const [tab, setTab] = useState<'image' | 'music' | 'prompt'>('image')
  const filtered = uploads.filter((u) => u.type === tab)
  const [isFollowing, setIsFollowing] = useState(false)

  const monthFormatter = useMemo(() =>
    new Intl.DateTimeFormat('hu-HU', { month: 'short', year: 'numeric' }),
  [])

  const monthlyMax = useMemo(() => {
    if (!stats.monthlyUploads.length) return 1
    return Math.max(...stats.monthlyUploads.map((item) => item.count), 1)
  }, [stats.monthlyUploads])

  const cumulativeHistory = useMemo(() => {
    let runningTotal = 0
    return stats.points.history.map((entry) => {
      runningTotal += entry.points
      return {
        date: entry.date,
        total: Number(runningTotal.toFixed(2)),
      }
    })
  }, [stats.points.history])

  const badgeTimeline = useMemo(() => {
    const earned = badges
      .map((b) => ({
        ...b,
        awarded: true as const,
      }))
      .sort((a, b) => new Date(a.awarded_at).getTime() - new Date(b.awarded_at).getTime())

    const upcoming = badgeOverview.upcoming.map((b) => ({
      ...b,
      awarded: false as const,
      awarded_at: null as string | null,
    }))

    return [...earned, ...upcoming]
  }, [badges, badgeOverview.upcoming])

  useEffect(() => {
    async function load() {
      if (!currentUserId) return
      const res = await fetch('/api/user/follow')
      if (res.ok) {
        const data = (await res.json()) as { following: string[] }
        setIsFollowing(data.following.includes(user.id))
      }
    }
    load()
  }, [currentUserId, user.id])

  async function followUser() {
    if (!currentUserId) return
    await fetch('/api/user/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, action: isFollowing ? 'unfollow' : undefined })
    })
    setIsFollowing(!isFollowing)
  }

  async function downloadFile(item: Upload) {
    try {
      const res = await fetch(`/api/uploads/${item.id}/download`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = item.name
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="relative mb-16">
        <Image
          src="https://source.unsplash.com/random/1200x300"
          alt="cover"
          width={1200}
          height={300}
          className="h-48 w-full rounded-md object-cover"
        />
        <div className="absolute -bottom-8 right-4">
          <div className={cn(user.id === currentUserId && user.profileFrameEnabled ? 'avatar-ring' : '')}>
            <Image
              src={user.avatar ?? ''}
              alt={user.name}
              width={96}
              height={96}
              className="rounded-full border-4 border-background"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <UserMiniCard user={user} currentUserId={currentUserId} />
        <div className="flex flex-col items-end">
          <span className="text-sm text-muted-foreground">Elérhető kreditek</span>
          <span className="text-lg font-semibold">{formatCredits(user.credits)}</span>
        </div>
      </div>
      {currentUserId === user.id ? (
        <p className="mb-4 text-sm text-primary">Your profile</p>
      ) : (
        <div className="flex gap-2 mb-4">
          <Button variant="outline" onClick={() => followUser()}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          <Button variant="outline">Send message</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Összes pont"
          value={stats.points.total.toLocaleString('hu-HU')}
          description={`Jelenlegi szint: ${stats.points.level}.`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatsCard
          title="Következő szint"
          value={
            stats.points.nextLevelThreshold
              ? `${stats.points.nextLevelThreshold.toLocaleString('hu-HU')} pont`
              : 'Maximális szint'
          }
          description={
            stats.points.nextLevelThreshold
              ? `${(stats.points.nextLevelThreshold - stats.points.total).toLocaleString('hu-HU')} pont szükséges.`
              : 'Gratulálunk, elérted a legmagasabb szintet!'
          }
        />
        <StatsCard
          title="Összes kedvelés"
          value={stats.engagement.totalLikes.toLocaleString('hu-HU')}
          description="A posztjaidra érkezett kedvelések."
          icon={<Heart className="h-6 w-6 text-rose-500" />}
        />
        <StatsCard
          title="Összes reakció"
          value={stats.engagement.totalReactions.toLocaleString('hu-HU')}
          description="A hozzászólásaidra érkezett reakciók."
          icon={<MessageCircle className="h-6 w-6 text-sky-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-3">Szint előrehaladás</h2>
            <ProgressBar
              value={stats.points.progress}
              label="Haladás a következő szintig"
              helperText={
                stats.points.nextLevelThreshold
                  ? `${(stats.points.total - stats.points.currentLevelThreshold).toLocaleString('hu-HU')} / ${(stats.points.nextLevelThreshold - stats.points.currentLevelThreshold).toLocaleString('hu-HU')} pont`
                  : 'Már a legmagasabb szinten vagy.'
              }
            />
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-3">Havi feltöltések</h2>
            <div className="space-y-3">
              {stats.monthlyUploads.map((item) => {
                const [year, month] = item.month.split('-').map((value) => Number(value))
                const label = Number.isFinite(year) && Number.isFinite(month)
                  ? monthFormatter.format(new Date(year, month - 1, 1))
                  : item.month
                const value = monthlyMax ? item.count / monthlyMax : 0
                return (
                  <ProgressBar
                    key={item.month}
                    value={value}
                    label={label}
                    helperText={`${item.count} feltöltés`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">Pontszám történet</h2>
          {cumulativeHistory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeHistory} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <RechartsTooltip formatter={(value: number) => `${value.toLocaleString('hu-HU')} pont`} labelFormatter={(label) => label} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#pointsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Még nincs ponttörténet azonosítható aktivitással.</p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Jelvények áttekintése</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {badgeTimeline.map((badge) => (
            <div
              key={badge.key}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                badge.awarded ? 'bg-primary/5 border-primary/40' : 'bg-muted'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>{badge.icon}</span>
                <div>
                  <p className="font-semibold">
                    {badge.name}
                    {!badge.awarded ? <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">hamarosan</span> : null}
                  </p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {badge.awarded ? (
                    <p className="mt-2 text-xs text-primary font-medium">
                      Megszerezve: {new Date(badge.awarded_at).toLocaleDateString('hu-HU')}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">Folytasd az aktivitást a megszerzéséhez!</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant={tab === 'image' ? 'default' : 'outline'} onClick={() => setTab('image')}>
          Images
        </Button>
        <Button variant={tab === 'music' ? 'default' : 'outline'} onClick={() => setTab('music')}>
          Music
        </Button>
        <Button variant={tab === 'prompt' ? 'default' : 'outline'} onClick={() => setTab('prompt')}>
          Prompts
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((u) => (
            <motion.div key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {u.type === 'image' ? (
                <WatermarkedImage src={u.url} alt={u.name} className="h-48 w-full object-cover rounded" />
              ) : u.type === 'music' ? (
                <audio controls className="w-full">
                  <source src={u.url} />
                </audio>
              ) : (
                <div className="p-3 border rounded bg-muted text-sm whitespace-pre-wrap">{u.name}</div>
              )}
              <div className="mt-2 text-right">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => downloadFile(u)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{`Download for ${u.download_points} credits`}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
