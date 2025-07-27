"use client"
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserMiniCard } from '@/components/user-mini-card'
import { Download } from 'lucide-react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import WatermarkedImage from '@/components/ui/WatermarkedImage'

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
  }
  uploads: Upload[]
  badges: {
    key: string
    name: string
    description: string
    icon: string
    awarded_at: string
  }[]
  currentUserId?: string
}

export default function ProfileClient({ user, uploads, badges, currentUserId }: Props) {
  const [tab, setTab] = useState<'image' | 'music' | 'prompt'>('image')
  const filtered = uploads.filter((u) => u.type === tab)

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
        <Badge variant="secondary">{user.credits} credits</Badge>
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((b) => (
            <TooltipProvider delayDuration={200} key={b.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xl cursor-default">{b.icon}</span>
                </TooltipTrigger>
                <TooltipContent>{`${b.name} – ${b.description}`}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
      {currentUserId === user.id ? (
        <p className="mb-4 text-sm text-primary">Your profile</p>
      ) : (
        <Button className="mb-4" variant="outline">
          Send message
        </Button>
      )}
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
