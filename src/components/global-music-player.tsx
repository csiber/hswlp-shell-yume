'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipForward, Heart, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [progress, setProgress] = useState(0)
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

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('play error:', err)
        setIsPlaying(false)
      })
    }
  }, [currentIndex, queue])

  // progress sáv frissítése
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
    }

    audio.addEventListener('timeupdate', update)
    return () => {
      audio.removeEventListener('timeupdate', update)
    }
  }, [])

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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center min-w-0 gap-2">
          <span className="text-lg">🎵</span>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" title={track.title}>{track.title}</div>
            <div className="text-xs text-muted-foreground truncate">
              {(track.user.name || track.user.email)} · {new Date(track.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="hidden md:flex" disabled>
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="hidden md:flex" disabled>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={playNext} disabled={currentIndex >= queue.length - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="hidden md:flex" disabled>
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progress}
            onChange={() => {}}
            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      <audio ref={audioRef} onEnded={handleEnded} className="hidden" />
    </div>
  )
}
