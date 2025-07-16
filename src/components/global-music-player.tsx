'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import LikeButton from '@/components/community/LikeButton'

interface Track {
  id: string
  title: string
  url: string
  created_at: string
  user: { name: string | null; email: string }
}

export default function GlobalMusicPlayer() {
  const [queue, setQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [open, setOpen] = useState(false)
  const [meta, setMeta] = useState<{
    title: string | null
    artist: string | null
    album: string | null
    picture: string | null
  } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // zene betöltése
  useEffect(() => {
    fetch('/api/music-feed')
      .then(res => res.json() as Promise<{ items: Track[] }> )
      .then(data => {
        setQueue(data.items)
      })
      .catch(err => console.error('music-feed hiba:', err))
  }, [])

  // forrás frissítése
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !queue[currentIndex]) return

    audio.src = queue[currentIndex].url
    audio.load()
    setCurrentTime(0)

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('play error:', err)
        setIsPlaying(false)
      })
    }
  }, [currentIndex, queue, isPlaying])

  // metaadatok betöltése
  useEffect(() => {
    const track = queue[currentIndex]
    if (!track) return
    fetch(`/api/music-meta?id=${track.id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setMeta(data)
      })
      .catch(() => {})
  }, [currentIndex, queue])


  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('play error:', err)
        })
    }
  }

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const handleEnded = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setIsPlaying(false)
    }
  }

  if (!queue.length) return null

  const track = queue[currentIndex]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2 flex items-center justify-between"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center min-w-0 gap-2">
          {meta?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.picture}
              alt={meta.title || track.title}
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <span className="text-lg">🎵</span>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" title={meta?.title || track.title}>{meta?.title || track.title}</div>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      <SheetContent side="bottom" className="p-4">
        <div className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center min-w-0 gap-2">
            {meta?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.picture}
                alt={meta.title || track.title}
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <span className="text-lg">🎵</span>
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" title={meta?.title || track.title}>{meta?.title || track.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {meta?.artist || track.user.name || track.user.email} · {new Date(track.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LikeButton postId={track.id} />
            <Button size="icon" variant="ghost" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={playNext} disabled={currentIndex >= queue.length - 1}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const time = Number(e.target.value)
            if (audioRef.current) audioRef.current.currentTime = time
            setCurrentTime(time)
          }}
          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
        />
      </SheetContent>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleEnded}
        className="hidden"
      />
    </Sheet>
  )
}
