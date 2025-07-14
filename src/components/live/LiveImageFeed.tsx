"use client"

import { useEffect, useState } from "react"

interface Item {
  id: string
  title: string | null
  url: string
}

export default function LiveImageFeed() {
  const [items, setItems] = useState<Item[]>([])

  async function load() {
    try {
      const res = await fetch("/api/live/image")
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={it.id} src={it.url} alt={it.title ?? ''} className="h-48 w-full object-cover" />
      ))}
    </div>
  )
}
