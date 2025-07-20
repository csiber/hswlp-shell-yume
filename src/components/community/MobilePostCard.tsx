"use client";

import { useEffect, useState, useCallback } from "react";
import ImageLightbox from "@/components/ui/ImageLightbox";
import LikeButton from "./LikeButton";
import MusicPlayer from "./MusicPlayer";
import PromptBox from "./PromptBox";
import { Eye, Download, MessageCircle } from "lucide-react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { useSessionStore } from "@/state/session";
import type { FeedItem } from "./CommunityFeedV3";

interface MobilePostCardProps {
  item: FeedItem;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
}

export default function MobilePostCard({
  item,
  audioRef,
  playingId,
  setPlayingId,
}: MobilePostCardProps) {
  const [viewCount, setViewCount] = useState(item.view_count ?? 0);
  const [playCount, setPlayCount] = useState(item.play_count ?? 0);
  const [commentCount, setCommentCount] = useState(0);
  const [text, setText] = useState("");
  const [promptText, setPromptText] = useState<string | null>(null);
  const [promptError, setPromptError] = useState(false);
  const fetchSession = useSessionStore((s) => s.fetchSession);

  useEffect(() => {
    fetch(`/api/posts/${item.id}/comments`)
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data) => setCommentCount((data.comments || []).length))
      .catch(() => {});
    if (item.type === "prompt") {
      fetch(item.url)
        .then((res) => res.text())
        .then((txt) => setPromptText(txt))
        .catch(() => setPromptError(true));
    }
  }, [item]);

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
      const res = await fetch(`/api/uploads/${item.id}/play`, { method: "POST" });
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
      const res = await fetch(`/api/uploads/${item.id}/view`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { view_count?: number };
        setViewCount(data.view_count ?? viewCount + 1);
      }
    } catch {
      setViewCount((c) => c + 1);
    }
  }, [item.id, viewCount]);

  async function submit() {
    if (!text.trim() || text.length > 500) return;
    try {
      const res = await fetch(`/api/posts/${item.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      setCommentCount((c) => c + 1);
      setText("");
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-[500px] mx-auto rounded-xl bg-[#1a1a1a] shadow overflow-hidden">
      <div className="w-full overflow-hidden">
        {item.type === "image" && (
          <ImageLightbox src={item.url} alt={item.title} onOpen={handleView}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.title} className="object-cover w-full" />
          </ImageLightbox>
        )}
        {item.type === "music" && (
          <div className="p-4">
            <MusicPlayer
              id={item.id}
              url={item.url}
              title={item.title}
              audioRef={audioRef}
              playingId={playingId}
              setPlayingId={setPlayingId}
              onPlay={handlePlay}
            />
          </div>
        )}
        {item.type === "prompt" && (
          <PromptBox text={promptError ? "A prompt nem olvasható" : promptText || ""} lines={5} />
        )}
      </div>
      <div className="p-4 grid grid-cols-2 gap-2 text-sm">
        <button onClick={handleDownload} className="flex items-center gap-1">
          <Download className="w-4 h-4" />
          {item.download_points ?? 2}
        </button>
        <LikeButton postId={item.id} />
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" /> {item.type === "music" ? playCount : viewCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" /> {commentCount}
        </span>
        {item.type !== "prompt" && <p className="col-span-2 font-semibold">{item.title}</p>}
        <div className="col-span-2 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Írj hozzászólást..."
            className="w-full rounded-md bg-zinc-800 p-3 min-h-[48px]"
            maxLength={500}
          />
          <button onClick={submit} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
