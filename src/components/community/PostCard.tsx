"use client";

import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MusicPlayer from "./MusicPlayer";
import PromptBox from "./PromptBox";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { useEffect, useState, useCallback } from "react";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useSessionStore } from "@/state/session";
import type { FeedItem } from "./CommunityFeedV3";

dayjs.extend(relativeTime);

interface PostCardProps {
  item: FeedItem;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
}

type MusicMeta = {
  title: string | null;
  artist: string | null;
  album: string | null;
  picture: string | null;
};

export default function PostCard({
  item,
  audioRef,
  playingId,
  setPlayingId,
}: PostCardProps) {
  const initials =
    item.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || item.user.email.slice(0, 2).toUpperCase();

  const [promptText, setPromptText] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState(item.play_count ?? 0);
  const [viewCount, setViewCount] = useState(item.view_count ?? 0);
  const [meta, setMeta] = useState<MusicMeta | null>(null);
  const fetchSession = useSessionStore((s) => s.fetchSession);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(`/api/uploads/${item.id}/download`);
      if (res.ok) {
        toast.success("Letöltés indítása");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.title;
        a.click();
        URL.revokeObjectURL(url);
        fetchSession?.();
      } else if (res.status === 402) {
        toast.error("Nincs elég kredit a letöltéshez");
      } else {
        toast.error("Letöltés sikertelen");
      }
    } catch {
      toast.error("Hálózati hiba történt");
    }
  }, [item.id, item.title, fetchSession]);

  const handlePlay = useCallback(async () => {
    try {
      const res = await fetch(`/api/uploads/${item.id}/play`, {
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as { play_count?: number };
        setPlayCount(data.play_count ?? playCount + 1);
      }
    } catch {
      setPlayCount((c) => c + 1);
    }
  }, [item.id, playCount]);

  const handleView = useCallback(async () => {
    try {
      const res = await fetch(`/api/uploads/${item.id}/view`, {
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as { view_count?: number };
        setViewCount(data.view_count ?? viewCount + 1);
      }
    } catch {
      setViewCount((c) => c + 1);
    }
  }, [item.id, viewCount]);

  useEffect(() => {
    if (item.type === "prompt") {
      fetch(item.url)
        .then((res) => res.text())
        .then((txt) => setPromptText(txt))
        .catch(() => setPromptError(true));
    }

    if (item.type === "music") {
      fetch(`/api/music-meta?id=${item.id}`)
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
    }
  }, [item]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col w-full max-w-md mx-auto rounded-2xl border bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900 p-4 transition-shadow hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-400"
    >
      <div className="mb-3 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {item.user.avatar_url && (
            <AvatarImage
              src={item.user.avatar_url}
              alt={item.user.name || item.user.email}
            />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              {item.user.name || item.user.email}
            </span>
            <span className="text-muted-foreground">
              {item.type === "music"
                ? "🎵"
                : item.type === "prompt"
                ? "💬"
                : "🖼"}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {dayjs(item.created_at).fromNow()}
          </span>
        </div>
      </div>
      <div className="mb-2">
        {item.type === "image" && (
          <ImageLightbox src={item.url} alt={item.title} onOpen={handleView}>
            <img
              src={item.url}
              alt={item.title}
              className="w-full rounded-xl object-cover"
            />
          </ImageLightbox>
        )}
        {item.type === "music" && (
          <div className="flex flex-col items-center gap-2">
            {meta?.picture && (
              <img
                src={meta.picture}
                alt={meta.title || item.title}
                className="w-full rounded-xl object-cover"
              />
            )}
            <div className="text-center text-sm">
              <h3>{meta?.title || item.title || "Ismeretlen szám"}</h3>
              {meta?.artist && <p>{meta.artist}</p>}
            </div>
            <MusicPlayer
              id={item.id}
              url={item.url}
              title={meta?.title || item.title || "Ismeretlen szám"}
              audioRef={audioRef}
              playingId={playingId}
              setPlayingId={setPlayingId}
              onPlay={handlePlay}
            />
          </div>
        )}
        {item.type === "prompt" && (
          <PromptBox
            text={promptError ? "A prompt nem olvasható" : promptText || ""}
            lines={5}
          />
        )}
      </div>
      {item.type !== "prompt" && (
        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
          {item.title}
        </p>
      )}
      <div className="mt-auto flex justify-between items-center text-gray-500">
        {item.type === "music" && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <span role="img" aria-label="plays">
              🎧
            </span>{" "}
            {playCount}
          </span>
        )}
        {item.type === "image" && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <span role="img" aria-label="views">
              👁️
            </span>{" "}
            {viewCount}
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4" />
            {item.download_points ?? 2}
          </button>
          <LikeButton postId={item.id} />
        </div>
      </div>
      <CommentList postId={item.id} />
    </motion.div>
  );
}
