"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { FeedItemData } from "./FeedItem"

const FeedItem = dynamic(() => import("./FeedItem"), { ssr: false })

export default function FeedGrid() {
  const [items, setItems] = useState<FeedItemData[]>([])
  const [visible, setVisible] = useState(9)
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/my-feed")
        const data = (await res.json()) as { items: FeedItemData[] }
        setItems(data.items || [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter)
  const show = filtered.slice(0, visible)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { key: "all", label: "Összes" },
          { key: "image", label: "Képek" },
          { key: "music", label: "Zenék" },
          { key: "prompt", label: "Promptek" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => {
              setFilter(btn.key)
              setVisible(9)
            }}
            className={`rounded-md px-3 py-1 text-sm bg-muted hover:bg-muted/70 ${filter === btn.key ? "font-semibold" : ""}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-center text-sm">Betöltés...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {show.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisible((v) => v + 9)}
                className="rounded-md bg-muted px-3 py-1 text-sm hover:bg-muted/70"
              >
                Továbbiak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
