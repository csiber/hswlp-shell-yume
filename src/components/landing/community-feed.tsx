"use client";

import { useEffect, useState } from "react";
import Image from 'next/image'

interface CommunityPreview {
  id: string;
  title: string;
  author: string;
  image_url: string;
  created_at: string;
  points?: number;
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/community-feed");
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { items?: CommunityPreview[] } | CommunityPreview[];
        const arr = Array.isArray(data) ? data : data.items;
        if (Array.isArray(arr)) {
          setPosts(arr.slice(0, 5) as CommunityPreview[]);
        }
      } catch (err) {
        console.warn("Unable to load community feed", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 text-gray-900 py-24 dark:bg-[#0c0c1f] dark:text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="bg-gray-50 text-gray-900 py-24 dark:bg-[#0c0c1f] dark:text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>Nincs elérhető közösségi tartalom</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 text-gray-900 py-24 dark:bg-[#0c0c1f] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl overflow-hidden shadow hover:shadow-lg transition border border-zinc-200 dark:border-zinc-800">
              <Image src={post.image_url} alt={post.title} width={400} height={192} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-gray-900 text-sm font-semibold dark:text-white">{post.title}</h3>
                <p className="text-zinc-500 text-xs mt-1 dark:text-zinc-400">
                  {post.author} • <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString("hu-HU")}</time>
                </p>
                <p className="text-indigo-600 text-xs mt-1 dark:text-indigo-400">⭐ {post.points ?? 2} pont</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
