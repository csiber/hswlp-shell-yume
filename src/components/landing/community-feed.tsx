"use client";

import { useEffect, useState } from "react";

interface CommunityPreview {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
  author: string;
  points?: number;
}

const fallbackPosts: CommunityPreview[] = [
  {
    id: "1",
    title: "Elindítottam az első AI portfólió oldalam!",
    author: "Noemi.art",
    created_at: "2025-07-10",
    image_url: "/favicon-96x96.png",
    points: 187,
  },
  {
    id: "2",
    title: "ComfyUI mobilról? Kipróbáltam és működik!",
    author: "aki_chan",
    created_at: "2025-07-09",
    image_url: "/favicon-96x96.png",
    points: 102,
  },
  {
    id: "3",
    title: "Zenészek figyelem: AI dallamgenerátor Yumekairában!",
    author: "mididev",
    created_at: "2025-07-08",
    image_url: "/favicon-96x96.png",
    points: 231,
  },
];

export default function CommunityFeed() {
  const [items, setItems] = useState<CommunityPreview[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/community-feed");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.items;
        if (Array.isArray(arr)) setItems(arr as CommunityPreview[]);
      } catch {
        // ignore errors
      }
    }
    load();
  }, []);

  const list = items.length > 0 ? items : fallbackPosts;

  return (
    <section className="bg-[#0c0c1f] text-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {list.map((post) => (
            <article key={post.id} className="space-y-2">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-lg"
              />
              <h3 className="text-sm font-semibold">{post.title}</h3>
              <p className="text-xs text-zinc-400">
                {post.author} •{' '}
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString("hu-HU")}
                </time>
              </p>
              {typeof post.points === "number" && (
                <p className="text-xs text-indigo-400">▲ {post.points}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
