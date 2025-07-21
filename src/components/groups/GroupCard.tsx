"use client"

import { Card } from '@/components/ui/card'
import { useState } from 'react'

export interface GroupItem {
  id: string
  slug: string
  name: string
  description: string
  cover_url: string | null
  is_member?: number | boolean
}

export default function GroupCard({ group }: { group: GroupItem }) {
  const [joined, setJoined] = useState(group.is_member === 1 || group.is_member === true)

  async function join() {
    if (joined) return
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: group.id }),
      })
      if (res.ok) setJoined(true)
    } catch (e) {
      console.error(e)
      // ignore
    }
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div
        className="h-32 bg-gray-300 bg-cover bg-center"
        style={group.cover_url ? { backgroundImage: `url(${group.cover_url})` } : {}}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {group.description}
        </p>
        <button
          onClick={join}
          disabled={joined}
          className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm hover:bg-primary/90 hover:scale-105 transition-transform disabled:opacity-70"
        >
          {joined ? 'Tag vagy' : 'Csatlakozás'}
        </button>
      </div>
    </Card>
  )
}
