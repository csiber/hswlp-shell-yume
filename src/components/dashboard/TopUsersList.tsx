"use client"

import { Image as ImageIcon, Music, PenLine, Star, Gem } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export interface TopUser {
  id: string
  nickname: string
  imageCount: number
  musicCount: number
  promptCount: number
  credits: number
}

export default function TopUsersList({ users }: { users: TopUser[] }) {
  if (!users || users.length === 0) {
    return <p className="text-center text-muted-foreground">No data available</p>
  }

  const [first, ...rest] = users

  const renderBadges = (user: TopUser) => (
    <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
      <Badge variant="secondary" className="flex items-center gap-1">
        <ImageIcon className="w-4 h-4" /> {user.imageCount}
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Music className="w-4 h-4" /> {user.musicCount}
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-1">
        <PenLine className="w-4 h-4" /> {user.promptCount}
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Gem className="w-4 h-4" /> {user.credits}
      </Badge>
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-6">
      {first && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-lg border-2 border-yellow-500 p-4 text-center relative"
        >
          <motion.div
            className="absolute -top-4 right-4 text-yellow-500"
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl font-bold">{first.nickname}</h2>
          {renderBadges(first)}
        </motion.div>
      )}
      <div className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {rest.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className={`rounded-lg border p-4 text-center ${idx < 2 ? 'text-lg font-semibold' : ''}`}
          >
            <h3 className={idx < 2 ? 'text-xl font-bold' : 'font-medium'}>{user.nickname}</h3>
            {renderBadges(user)}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
