"use client"
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserMiniCard } from '@/components/user-mini-card'

type Upload = {
  id: string
  type: 'image' | 'music' | 'prompt'
  url: string
  name: string
  created_at: string
}

interface Props {
  user: { id: string; name: string; email: string; avatar?: string | null; credits: number }
  uploads: Upload[]
  currentUserId?: string
}

export default function ProfileClient({ user, uploads, currentUserId }: Props) {
  const [tab, setTab] = useState<'image' | 'music' | 'prompt'>('image')
  const filtered = uploads.filter((u) => u.type === tab)

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
          <Image
            src={user.avatar ?? ''}
            alt={user.name}
            width={96}
            height={96}
            className="rounded-full border-4 border-background"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <UserMiniCard user={user} />
        <Badge variant="secondary">{user.credits} kredit</Badge>
      </div>
      {currentUserId === user.id ? (
        <p className="mb-4 text-sm text-primary">Saját profilod</p>
      ) : (
        <Button className="mb-4" variant="outline">
          Üzenet küldése
        </Button>
      )}
      <div className="flex gap-2 mb-4">
        <Button variant={tab === 'image' ? 'default' : 'outline'} onClick={() => setTab('image')}>
          Képek
        </Button>
        <Button variant={tab === 'music' ? 'default' : 'outline'} onClick={() => setTab('music')}>
          Zenék
        </Button>
        <Button variant={tab === 'prompt' ? 'default' : 'outline'} onClick={() => setTab('prompt')}>
          Promtok
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((u) => (
            <motion.div key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {u.type === 'image' ? (
                <Image src={u.url} alt={u.name} width={300} height={300} className="h-48 w-full object-cover rounded" />
              ) : u.type === 'music' ? (
                <audio controls className="w-full">
                  <source src={u.url} />
                </audio>
              ) : (
                <div className="p-3 border rounded bg-muted text-sm whitespace-pre-wrap">{u.name}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
