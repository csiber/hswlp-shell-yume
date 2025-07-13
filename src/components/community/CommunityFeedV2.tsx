"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Play, StopCircle, Quote, Box } from "lucide-react";

interface FeedItem {
  id: string;
  title: string;
  type?: "image" | "music" | "prompt";
  url: string;
  created_at: string;
  user: {
    name: string | null;
    email: string;
  };
}

dayjs.extend(relativeTime);

export default function CommunityFeedV2() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [visible, setVisible] = useState(10);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function loadFeed() {
    setLoading(true);
    try {
      const res = await fetch("/api/community-feed");
      if (!res.ok) throw new Error("failed to load feed");
      const raw = await res.json();
      let arr: unknown = (raw.items ?? raw) as unknown;
      if (!Array.isArray(arr)) {
        console.warn("/api/community-feed válasz nem tömb");
        arr = [];
      }
      const mapped: FeedItem[] = (arr as FeedItem[]).map((it) => ({
        id: it.id,
        title: it.title,
        type:
          it.type === "image" || it.type === "music" || it.type === "prompt"
            ? it.type
            : "image",
        url: it.url,
        created_at: it.created_at,
        user: it.user,
      }));
      mapped.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setItems(mapped);
      setVisible(10);
    } catch (err) {
      console.warn("Hiba a feed betöltésekor", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function togglePlay(item: FeedItem) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === item.id) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingId(null);
    } else {
      audio.src = item.url;
      audio.play().catch(() => undefined);
      setPlayingId(item.id);
    }
  }

  useEffect(() => {
    loadFeed();
    const timer = setInterval(loadFeed, 60000);
    return () => clearInterval(timer);
  }, []);

  const visibleItems = items.slice(0, visible);

  return (
    <Card className="min-h-[100vh] flex-1 md:min-h-min">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Közösségi feed</CardTitle>
        <button
          onClick={loadFeed}
          className="rounded-md bg-muted px-2 py-1 text-sm shadow hover:shadow-lg"
        >
          Frissítés
        </button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-60 w-full" />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-muted-foreground">
            <Box className="mb-4 h-16 w-16 animate-bounce" />
            <p className="text-sm">Nincs még tartalom</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-lg bg-muted p-4 text-muted-foreground shadow hover:shadow-lg"
                  >
                    <div className="mb-2 flex justify-between text-xs">
                      <span>{item.user.name || item.user.email}</span>
                      <span>{dayjs(item.created_at).fromNow()}</span>
                    </div>
                    {item.type === "image" ? (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.title}
                          className="max-h-60 w-full rounded-md object-cover"
                        />
                      </div>
                    ) : item.type === "music" ? (
                      <div className="flex flex-col items-center">
                        <span className="mb-2 font-semibold">{item.title}</span>
                        <button
                          onClick={() => togglePlay(item)}
                          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground shadow hover:shadow-lg"
                        >
                          {playingId === item.id ? (
                            <StopCircle className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          {playingId === item.id ? "Stop" : "Play"}
                        </button>
                      </div>
                    ) : (
                      <blockquote className="relative rounded-md border border-muted-foreground/20 bg-background p-4 italic">
                        <Quote className="absolute left-2 top-2 h-4 w-4 opacity-50" />
                        {item.title}
                      </blockquote>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
            {visible < items.length && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + 10)}
                  className="rounded-md bg-muted px-3 py-1 text-sm shadow hover:shadow-lg"
                >
                  Továbbiak betöltése
                </button>
              </div>
            )}
          </>
        )}
        <audio ref={audioRef} hidden />
      </CardContent>
    </Card>
  );
}
