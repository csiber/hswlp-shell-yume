"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { AnimatePresence, motion } from "framer-motion"

interface FeedItem {
  id: string
  title: string
  type: "image" | "music" | "prompt"
  url: string
  created_at: string
  user: {
    name: string | null
    email: string
  }
}

dayjs.extend(relativeTime)

export default function CommunityFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

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
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
      )
    } catch (err) {
      console.error(err)
    }
  }

  function togglePlay(item: FeedItem) {
    const audio = audioRef.current
    if (!audio) return

    if (playingId === item.id) {
      audio.pause()
      audio.currentTime = 0
      setPlayingId(null)
    } else {
      audio.src = item.url
      audio.play().catch(() => undefined)
      setPlayingId(item.id)
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
        <CardTitle>Közösségi feed</CardTitle>
        <button
          onClick={loadFeed}
          className="rounded-md bg-muted px-2 py-1 text-sm shadow"
        >
          Frissítés
        </button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Még nincsenek feltöltések a közösségi feedben.
            </p>
          )}
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4 rounded-lg bg-muted p-4 text-muted-foreground shadow-md hover:shadow-lg transition"
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
                    className="max-w-xs rounded-md object-cover"
                  />
                </div>
              ) : item.type === "music" ? (
                <div className="flex items-center justify-between">
                  <span className="font-semibold mr-2">{item.title}</span>
                  <button
                    onClick={() => togglePlay(item)}
                    className="rounded-md bg-muted px-2 py-1 text-sm shadow"
                  >
                    {playingId === item.id ? "Stop" : "Play"}
                  </button>
                </div>
              ) : (
                <blockquote className="rounded-md border border-muted-foreground/20 p-3 italic">
                  {item.title}
                </blockquote>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <audio ref={audioRef} hidden />
      </CardContent>
    </Card>
  )
}
