"use client"

import { useEffect, useState } from "react"

interface Item {
  id: string
  title: string | null
  url: string
}

export default function LiveMusicFeed() {
  const [items, setItems] = useState<Item[]>([])

  async function load() {
    try {
      const res = await fetch("/api/live/music")
      if (res.ok) {
        const data = (await res.json()) as { items?: Item[] }
        setItems(data.items ?? [])
      }
    } catch {
      // ignore errors
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.id} className="space-y-1">
          <audio controls src={it.url} className="w-full" />
          {it.title && <p className="text-sm text-center">{it.title}</p>}
        </div>
      ))}
    </div>
  )
}
