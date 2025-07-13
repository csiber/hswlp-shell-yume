"use client"

import { useEffect, useRef, useState } from "react"
import PostCard from "./PostCard"
import SkeletonPost from "./SkeletonPost"

export interface FeedItem {
  id: string
  title: string
  type?: "image" | "music" | "prompt"
  url: string
  created_at: string
  user: {
    name: string | null
    email: string
  }
}

export default function CommunityFeedV3() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [visible, setVisible] = useState(10)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setPlayingId(null)
    audio.addEventListener("ended", onEnded)
    return () => audio.removeEventListener("ended", onEnded)
  }, [])

  async function loadFeed() {
    setLoading(true)
    try {
      const res = await fetch("/api/community-feed")
      if (!res.ok) throw new Error("failed to load feed")
      const raw: unknown = await res.json()
      type FeedResponse = { items?: FeedItem[] } | FeedItem[] | unknown
      const data = raw as FeedResponse
      let arr: FeedItem[] = []
      if (Array.isArray(data)) arr = data
      else if (Array.isArray((data as { items?: unknown }).items))
        arr = (data as { items?: FeedItem[] }).items as FeedItem[]
      const detect = (url: string): "image" | "music" | "prompt" => {
        const ext = url.split(".").pop()?.toLowerCase() || ""
        if (["mp3", "wav", "ogg"].includes(ext)) return "music"
        if (["txt", "prompt"].includes(ext)) return "prompt"
        return ["jpg", "jpeg", "png", "webp"].includes(ext) ? "image" : "image"
      }
      arr = arr.map((it) => ({
        ...it,
        type:
          it.type === "music" || it.type === "prompt" || it.type === "image"
            ? it.type
            : detect(it.url),
      }))
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setItems(arr)
      setVisible(10)
    } catch (err) {
      console.warn("Hiba a feed betöltésekor", err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed()
    const timer = setInterval(loadFeed, 60000)
    return () => clearInterval(timer)
  }, [])

  const visibleItems = items.slice(0, visible)

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="mb-4 flex justify-end">
        <button onClick={loadFeed} className="rounded-md bg-muted px-2 py-1 text-sm shadow hover:bg-gray-100 dark:hover:bg-zinc-800">
          Frissítés
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-muted-foreground">
          <svg className="mb-4 h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <p className="text-sm">Nincs közösségi tartalom</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <PostCard key={item.id} item={item} audioRef={audioRef} playingId={playingId} setPlayingId={setPlayingId} />
            ))}
          </div>
          {visible < items.length && (
            <div className="mt-4 flex justify-center">
              <button onClick={() => setVisible((v) => v + 10)} className="rounded-md bg-muted px-3 py-1 text-sm shadow hover:bg-gray-100 dark:hover:bg-zinc-800">
                Továbbiak betöltése
              </button>
            </div>
          )}
        </>
      )}
      <audio ref={audioRef} hidden />
    </div>
  )
}

