"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import LikeButton from "@/components/community/LikeButton";
import WatermarkedImage from '@/components/ui/WatermarkedImage'

interface Track {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user: { name: string | null; email: string };
}

type MusicMeta = {
  title: string | null;
  artist: string | null;
  album: string | null;
  picture: string | null;
};

export default function GlobalMusicPlayer() {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState<MusicMeta | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    fetch("/api/music-feed")
      .then((res) => res.json() as Promise<{ items: Track[] }>)
      .then((data) => {
        setQueue(data.items);
      })
      .catch((err) => console.error("music-feed hiba:", err));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !queue[currentIndex]) return;

    audio.src = queue[currentIndex].url;
    audio.load();
    setCurrentTime(0);

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error("play error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentIndex, queue, isPlaying]);

  useEffect(() => {
    const track = queue[currentIndex];
    if (!track) return;
    fetch(`/api/music-meta?id=${track.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((rawData) => {
        if (rawData && typeof rawData === "object") {
          const data = rawData as Partial<MusicMeta>;
          setMeta({
            title: data.title ?? null,
            artist: data.artist ?? null,
            album: data.album ?? null,
            picture: data.picture ?? null,
          });
        }
      })
      .catch(() => {});
  }, [currentIndex, queue]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("play error:", err);
        });
    }
  };

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

  if (!queue.length) return null;

  const track = queue[currentIndex];
  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2 flex items-center justify-between max-h-16 overflow-hidden sm:max-h-none"
      >
        <div className="flex items-center min-w-0 gap-2">
          {meta?.picture ? (
            <WatermarkedImage
              src={meta.picture}
              alt={meta.title || track.title}
              width={32}
              height={32}
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <span className="text-lg">🎵</span>
          )}
          <div className="min-w-0">
            <div
              className="text-sm font-medium truncate"
              title={meta?.title || track.title}
            >
              {meta?.title || track.title}
            </div>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
      <SheetContent side="bottom" className="p-4">
        <div className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center min-w-0 gap-2">
            {meta?.picture ? (
              <WatermarkedImage
                src={meta.picture}
                alt={meta.title || track.title}
                width={48}
                height={48}
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <span className="text-lg">🎵</span>
            )}
            <div className="min-w-0">
              <div
                className="text-sm font-medium truncate"
                title={meta?.title || track.title}
              >
                {meta?.title || track.title}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {meta?.artist || track.user.name || track.user.email} ·{" "}
                {new Date(track.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LikeButton postId={track.id} />
            <Button size="icon" variant="ghost" onClick={togglePlay}>
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={playNext}
              disabled={currentIndex >= queue.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const time = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = time;
              setCurrentTime(time);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%)`,
            }}
          />
          <span className="text-xs w-10 tabular-nums">
            {formatTime(Math.max(duration - currentTime, 0))}
          </span>
        </div>
      </SheetContent>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleEnded}
        className="hidden"
      />
    </Sheet>
  );
}
