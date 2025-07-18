"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import PostCard from "./PostCard";
import SkeletonPost from "./SkeletonPost";
import UploadBox from "./UploadBox";
import FeedStats, { type FeedFilter } from "./FeedStats";
import AlbumCard from "./AlbumCard";

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
  };
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
  const [visible, setVisible] = useState(10);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedFilter>("all");
  const audioRef = useRef<HTMLAudioElement>(null);

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlayingId(null);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
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
      setAlbums(alb);

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

      arr.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(arr);
      setVisible(10);
    } catch (err) {
      console.warn("Hiba a feed betöltésekor", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadFeed();
    const timer = setInterval(loadFeed, 60000);
    return () => clearInterval(timer);
  }, [endpoint, loadFeed]);

  useEffect(() => {
    if (inView && visible < items.length) {
      setVisible((v) => v + 10);
    }
  }, [inView, visible, items.length]);

  useEffect(() => {
    setVisible(10);
  }, [filter]);

  const filteredItems = items.filter((it) =>
    filter === "all" ? true : it.type === filter
  );
  const visibleItems = filteredItems.slice(0, visible);

  const stats = {
    total: items.length,
    images: items.filter((i) => i.type === "image").length,
    music: items.filter((i) => i.type === "music").length,
    prompts: items.filter((i) => i.type === "prompt").length,
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl xl:mx-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
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
          <p className="text-sm">Nincs közösségi tartalom</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
            {visibleItems.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <PostCard
                  item={item}
                  audioRef={audioRef}
                  playingId={playingId}
                  setPlayingId={setPlayingId}
                />
              </div>
            ))}
          </div>
          {visible < items.length && <div ref={loadMoreRef} className="h-12" />}
        </>
      )}

      <audio ref={audioRef} hidden />
    </div>
  );
}
