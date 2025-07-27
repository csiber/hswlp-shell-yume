"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "./PostCard";
import SkeletonPost from "./SkeletonPost";
import UploadBox from "./UploadBox";
import FeedStats, { type FeedFilter } from "./FeedStats";
import AlbumCard from "./AlbumCard";
import { useSessionStore } from "@/state/session";

export interface FeedItem {
  id: string;
  title: string;
  tags?: string | null;
  type?: "image" | "music" | "prompt";
  url: string;
  download_points?: number;
  created_at: string;
  view_count?: number;
  play_count?: number;
  user: {
    name: string | null;
    email: string;
    avatar_url?: string | null;
    badge?: { icon: string; name: string; description: string };
  };
  pinned?: boolean;
}

export interface AlbumItem {
  id: string;
  name: string;
  images: string[];
  created_at: string;
  author: string;
}

export default function CommunityFeedV3({
  endpoint = "/api/community-feed",
}: { endpoint?: string } = {}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedFilter>("all");
  const audioRef = useRef<HTMLAudioElement>(null);
  const session = useSessionStore((s) => s.session);
  const guest = !session?.user?.id;

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlayingId(null);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  const loadFeed = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${endpoint}?page=${p}`);
      if (!res.ok) throw new Error("failed to load feed");
      const raw: unknown = await res.json();
      type FeedResponse = { items?: FeedItem[]; albums?: AlbumItem[] } | unknown;
      const data = raw as FeedResponse;
      let arr: FeedItem[] = [];
      if (Array.isArray(data)) arr = data as FeedItem[];
      else if (Array.isArray((data as { items?: unknown }).items))
        arr = (data as { items?: FeedItem[]; albums?: AlbumItem[] }).items as FeedItem[];
      const alb = Array.isArray((data as { albums?: unknown }).albums)
        ? ((data as { albums?: AlbumItem[] }).albums as AlbumItem[])
        : [];
      if (p === 1) {
        setAlbums(alb);
      }

      const detect = (url: string): "image" | "music" | "prompt" => {
        const ext = url.split(".").pop()?.toLowerCase() || "";
        if (["mp3", "wav", "ogg"].includes(ext)) return "music";
        if (["txt", "prompt"].includes(ext)) return "prompt";
        return ["jpg", "jpeg", "png", "webp"].includes(ext) ? "image" : "image";
      };

      arr = arr.map((it) => ({
        ...it,
        type:
          it.type === "music" || it.type === "prompt" || it.type === "image"
            ? it.type
            : detect(it.url),
      }));

      const pinned = arr.filter((i) => i.pinned);
      const others = arr.filter((i) => !i.pinned);
      others.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      if (p === 1) {
        setItems([...pinned, ...others]);
      } else {
        setItems((prev) => [...prev, ...others]);
      }
      const respLimit: number =
        typeof (data as { limit?: number }).limit === "number"
          ? (data as { limit?: number }).limit as number
          : 20;
      if (arr.length < respLimit) setHasMore(false);
    } catch (err) {
      console.warn("Error loading feed", err);
      if (p === 1) setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadFeed(page);
  }, [page, loadFeed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage(1);
      setHasMore(true);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [filter, endpoint]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((p) => p + 1);
    }
  }, [inView, hasMore, loading]);

  const filteredItems = items.filter((it) =>
    filter === "all" ? true : it.type === filter
  );

  const stats = {
    total: items.length,
    images: items.filter((i) => i.type === "image").length,
    music: items.filter((i) => i.type === "music").length,
    prompts: items.filter((i) => i.type === "prompt").length,
  };

  const gallery = filteredItems
    .filter((i) => i.type === "image")
    .map((it) => ({
      src: it.url,
      alt: it.title,
      title: it.title,
      author: it.user.name || it.user.email,
    }));

  const galleryIndex = new Map(
    filteredItems
      .filter((i) => i.type === "image")
      .map((it, idx) => [it.id, idx])
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl xl:mx-auto rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-lg py-4">
      <UploadBox onUpload={loadFeed} />

      {!loading && items.length > 0 && (
        <FeedStats
          total={stats.total}
          images={stats.images}
          music={stats.music}
          prompts={stats.prompts}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-muted-foreground">
          <svg
            className="mb-4 h-16 w-16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <p className="text-sm">No community content available</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              layout
            >
              {albums.map((album) => (
                <motion.div key={album.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <AlbumCard album={album} />
                </motion.div>
              ))}
              {filteredItems.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <PostCard
                    item={item}
                    audioRef={audioRef}
                    playingId={playingId}
                    setPlayingId={setPlayingId}
                    isGuest={guest}
                    images={gallery}
                    index={galleryIndex.get(item.id) ?? 0}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {hasMore && <div ref={loadMoreRef} className="h-12" />}
        </>
      )}

      <audio ref={audioRef} hidden />
    </div>
  );
}
