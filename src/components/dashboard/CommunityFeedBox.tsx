"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { AnimatePresence, motion } from "framer-motion"

dayjs.extend(relativeTime)

interface FeedItem {
  id: string
  user: { name?: string; email?: string }
  type: "image" | "music" | "prompt"
  title: string
  created_at: string
  url: string
}

export function CommunityFeedBox() {
  const [items, setItems] = useState<FeedItem[]>([])

  async function loadFeed() {
    try {
      const res = await fetch("/api/community-feed")
      if (!res.ok) throw new Error("failed to load feed")
      const data: FeedItem[] = await res.json()
      setItems(
        data
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
      )
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadFeed()
    const timer = setInterval(loadFeed, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="min-h-[100vh] flex-1 md:min-h-min">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Friss közösségi feed</CardTitle>
        <button
          onClick={loadFeed}
          className="rounded-md bg-muted px-2 py-1 text-sm shadow"
        >
          Frissítés
        </button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4 rounded-lg bg-muted p-4 text-muted-foreground shadow-md"
            >
              <div className="mb-2 flex justify-between text-xs">
                <span>{item.user.name || item.user.email}</span>
                <span>{dayjs(item.created_at).fromNow()}</span>
              </div>
              {item.type === "image" ? (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.title}
                    className="max-h-48 rounded-md object-cover"
                  />
                </div>
              ) : item.type === "music" ? (
                <div className="space-y-2">
                  <div className="font-semibold">{item.title}</div>
                  <audio src={item.url} controls className="w-full" />
                </div>
              ) : (
                <div className="rounded-md border border-muted-foreground/20 p-3">
                  {item.title}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
