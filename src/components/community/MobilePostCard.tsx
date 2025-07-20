"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import ImageLightbox from "@/components/ui/ImageLightbox";
import MusicPlayer from "./MusicPlayer";
import PromptBox from "./PromptBox";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import { Download, Eye, MessageSquare } from "lucide-react";
import type { FeedItem } from "./CommunityFeedV3";

interface MobilePostCardProps {
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

export default function MobilePostCard({
  item,
  audioRef,
  playingId,
  setPlayingId,
}: MobilePostCardProps) {
  const [promptText, setPromptText] = useState<string | null>(null);
  const [meta, setMeta] = useState<MusicMeta | null>(null);
  const [viewCount, setViewCount] = useState(item.view_count ?? 0);
  const [commentCount, setCommentCount] = useState(0);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(`/api/uploads/${item.id}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.title;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // ignore
    }
  }, [item.id, item.title]);

  const handlePlay = useCallback(async () => {
    try {
      await fetch(`/api/uploads/${item.id}/play`, { method: "POST" });
    } catch {
      // ignore
    }
  }, [item.id]);

  const handleView = useCallback(async () => {
    try {
      const res = await fetch(`/api/uploads/${item.id}/view`, { method: "POST" });
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
        .catch(() => setPromptText(null));
    }
    if (item.type === "music") {
      fetch(`/api/music-meta?id=${item.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((raw) => {
          if (raw && typeof raw === "object") {
            const data = raw as Partial<MusicMeta>;
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
    fetch(`/api/posts/${item.id}/comments`)
      .then((r) => (r.ok ? r.json() : { comments: [] }))
      .then((d) => setCommentCount((d.comments || []).length))
      .catch(() => {});
  }, [item]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-[500px] mx-auto rounded-xl shadow bg-[#1a1a1a] overflow-hidden pb-4"
    >
      <div className="overflow-hidden">
        {item.type === "image" && (
          <ImageLightbox src={item.url} alt={item.title} onOpen={handleView}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-64 object-cover"
            />
          </ImageLightbox>
        )}
        {item.type === "music" && (
          <div className="flex flex-col items-center">
            {meta?.picture && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.picture}
                  alt={meta.title || item.title}
                  className="w-full h-64 object-cover"
                />
              </>
            )}
            <MusicPlayer
              id={item.id}
              url={item.url}
              title={meta?.title || item.title}
              audioRef={audioRef}
              playingId={playingId}
              setPlayingId={setPlayingId}
              onPlay={handlePlay}
            />
          </div>
        )}
        {item.type === "prompt" && (
          <PromptBox text={promptText || ""} lines={5} />
        )}
      </div>
      <div className="px-4 pt-3 space-y-2">
        <div className="grid grid-cols-4 text-center gap-2 text-sm">
          <button onClick={handleDownload} className="flex flex-col items-center">
            <Download className="w-5 h-5" />
          </button>
          <LikeButton postId={item.id} />
          <div className="flex flex-col items-center text-muted-foreground">
            <Eye className="w-5 h-5" />
            {viewCount}
          </div>
          <div className="flex flex-col items-center text-muted-foreground">
            <MessageSquare className="w-5 h-5" />
            {commentCount}
          </div>
        </div>
        {item.title && (
          <p className="text-sm font-semibold break-words">{item.title}</p>
        )}
        <CommentList postId={item.id} />
      </div>
    </motion.div>
  );
}

