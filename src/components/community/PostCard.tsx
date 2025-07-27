"use client";

import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MusicPlayer from "./MusicPlayer";
import PromptBox from "./PromptBox";
import ImageLightbox from "@/components/ui/ImageLightbox";
import WatermarkedImage from "@/components/ui/WatermarkedImage";
import { useEffect, useState, useCallback } from "react";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import { Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareButtons from "@/components/share-buttons";
import { useSessionStore } from "@/state/session";
import type { FeedItem } from "./CommunityFeedV3";

dayjs.extend(relativeTime);
dayjs.locale("en");

interface PostCardProps {
  item: FeedItem;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
  isGuest?: boolean;
  images?: { src: string; alt?: string; title?: string | null; author?: string | null }[];
  index?: number;
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
  isGuest,
  images,
  index,
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
  const session = useSessionStore((s) => s.session);
  const guest = isGuest ?? !session?.user?.id;

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col w-full mx-auto"
    >
      {item.pinned && (
        <span className="absolute right-2 top-2 z-10 text-xs rounded bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100 px-2 py-0.5">
          📌 Pinned
        </span>
      )}
      {item.type === "image" && (
        <ImageLightbox
          src={item.url}
          alt={item.title}
          onOpen={handleView}
          images={images}
          index={index}
        >
          <WatermarkedImage
            src={item.url}
            alt={item.title}
            className="w-full aspect-square object-cover rounded-none"
          />
        </ImageLightbox>
      )}
      {item.type === "music" && (
        <div className="flex flex-col items-center gap-2">
          {meta?.picture && (
            <WatermarkedImage
              src={meta.picture}
              alt={meta.title || item.title}
              className="w-full aspect-square object-cover rounded-none"
            />
          )}
            <div className="text-center text-sm">
              <h3>{meta?.title || item.title || "Unknown track"}</h3>
              {meta?.artist && <p>{meta.artist}</p>}
            </div>
            <MusicPlayer
              id={item.id}
              url={item.url}
              title={meta?.title || item.title || "Unknown track"}
              audioRef={audioRef}
              playingId={playingId}
              setPlayingId={setPlayingId}
              onPlay={handlePlay}
            />
          </div>
        )}
        {item.type === "prompt" && (
          <PromptBox
            text={promptError ? "Prompt not readable" : promptText || ""}
            lines={5}
          />
        )}
      {item.type !== "prompt" && (
        <div className="flex justify-between items-center px-2 py-1">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {item.user.avatar_url && (
                <AvatarImage src={item.user.avatar_url} alt={item.user.name || item.user.email} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{item.user.name || item.user.email}</span>
          </div>
          <div className="flex items-center gap-3 opacity-70">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1">
                  <Share2 className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-2">
                <ShareButtons
                  title={item.title}
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${item.id}`}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <LikeButton postId={item.id} isGuest={guest} />
          </div>
        </div>
      )}
      <CommentList postId={item.id} isGuest={guest} />
      {guest && (
        <div className="mt-4 rounded-md bg-amber-500 text-white text-center py-2">
          🔓 Sign in or sign up to unlock more features
        </div>
      )}
    </motion.div>
  );
}
