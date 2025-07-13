"use client"

import {
  PlayIcon,
  StopIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline"

interface Props {
  id: string
  url: string
  title: string
  audioRef: React.RefObject<HTMLAudioElement>
  playingId: string | null
  setPlayingId: (id: string | null) => void
}

export default function MusicPlayer({
  id,
  url,
  title,
  audioRef,
  playingId,
  setPlayingId,
}: Props) {
  const isPlaying = playingId === id

  function toggle() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
      setPlayingId(null)
    } else {
      audio.src = url
      audio.play().catch(() => undefined)
      setPlayingId(id)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-md bg-gray-100 dark:bg-zinc-800 p-3">
      <div className="flex items-center gap-2">
        <MusicalNoteIcon className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <button
        onClick={toggle}
        className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-sm text-primary-foreground shadow hover:bg-primary/90"
      >
        {isPlaying ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        {isPlaying ? "Stop" : "Play"}
      </button>
    </div>
  )
}

