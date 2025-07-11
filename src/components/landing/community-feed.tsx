"use client";

import { useState } from "react";
import clsx from "clsx";

const tabs = ["Népszerű", "Legújabb", "Követettek"];

const posts = [
  {
    id: 1,
    title: "Elindítottam az első AI portfólió oldalam!",
    author: "Noemi.art",
    date: "2025.07.10.",
    comments: 12,
    votes: 187,
  },
  {
    id: 2,
    title: "ComfyUI mobilról? Kipróbáltam és működik!",
    author: "aki_chan",
    date: "2025.07.09.",
    comments: 8,
    votes: 102,
  },
  {
    id: 3,
    title: "Zenészek figyelem: AI dallamgenerátor Yume-ban!",
    author: "mididev",
    date: "2025.07.08.",
    comments: 21,
    votes: 231,
  },
];

export default function CommunityFeed() {
  const [activeTab, setActiveTab] = useState("Népszerű");

  return (
    <section className="bg-[#0c0c1f] text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <div className="flex gap-6 border-b border-zinc-700 pb-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={clsx(
                  "text-sm font-medium pb-1 border-b-2 transition-all",
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-zinc-400 hover:text-white"
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#111122] rounded-xl p-5 border border-zinc-800 shadow-sm hover:shadow-lg transition"
              >
                <div className="text-sm text-zinc-500 flex justify-between">
                  <span>
                    by <strong className="text-white">{post.author}</strong>
                  </span>
                  <span>
                    {post.date} • {post.comments} hozzászólás
                  </span>
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {post.title}
                </div>
                <div className="mt-3 text-indigo-400 text-sm">
                  ▲ {post.votes}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="hidden md:block">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Keresés..."
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none"
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-400 mb-2">
              Friss bejegyzések
            </h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>🎨 LaraZine – Portfólió sablon tippek</li>
              <li>🎧 RinMusic – AI Lo-fi hangok exportja</li>
              <li>🖼 AIShoujo – Vektoros stílus kimenetek</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
