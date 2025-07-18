"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/state/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/hu";

dayjs.extend(relativeTime);
dayjs.locale("hu");

interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

interface Comment {
  id: string
  text: string
  created_at: string
  user: { name: string; avatar?: string }
  reactions: Reaction[]
}

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [visible, setVisible] = useState(2);
  const [text, setText] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [emojiActive, setEmojiActive] = useState(false);
  const session = useSessionStore(s => s.session);

  useEffect(() => {
    const stored = localStorage.getItem('emoji_reaction_active');
    if (stored === '1') setEmojiActive(true);
  }, []);

  useEffect(() => {
    if (session?.user?.emojiReactionsEnabled) {
      setEmojiActive(true);
    }
  }, [session]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (!res.ok) return;
      const data = (await res.json()) as { comments: Comment[] };
      setComments(data.comments);
      } catch {
        // ignore
      }
    }
    load();
  }, [postId]);

  async function sendReaction(commentId: string, emoji: string, remove: boolean) {
    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: remove ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) return;
      setComments(cs =>
        cs.map(c => {
          if (c.id !== commentId) return c;
          const existing = c.reactions.find(r => r.emoji === emoji);
          if (remove) {
            if (existing) {
              const newCount = existing.count - 1;
              const rest = c.reactions.filter(r => r.emoji !== emoji);
              return {
                ...c,
                reactions: newCount > 0 ? [...rest, { ...existing, count: newCount, reacted: false }] : rest,
              };
            }
            return c;
          } else {
            if (existing) {
              return {
                ...c,
                reactions: c.reactions.map(r =>
                  r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r
                ),
              };
            }
            return {
              ...c,
              reactions: [...c.reactions, { emoji, count: 1, reacted: true }],
            };
          }
        })
      );
    } catch {
      // ignore
    }
  }

  function toggleReaction(commentId: string, emoji: string, reacted: boolean) {
    sendReaction(commentId, emoji, reacted);
  }

  async function deleteComment(commentId: string) {
    if (!confirm('Biztosan törlöd a hozzászólást?')) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setComments(cs => cs.filter(c => c.id !== commentId));
    } catch {
      // ignore
    }
  }

  async function submit() {
    if (!text.trim() || text.length > 500) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { comment: Omit<Comment, 'reactions'> };
      setComments((c) => [...c, { ...data.comment, reactions: [] }]);
      setVisible((v) => v + 1);
      setText("");
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
        Hozzászólások
      </h4>
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {comments.slice(0, visible).map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2"
            >
              <Avatar className="h-6 w-6">
                {c.user.avatar ? (
                  <AvatarImage src={c.user.avatar} alt={c.user.name} />
                ) : (
                  <AvatarFallback>
                    {c.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-sm">
                <p className="leading-none">
                  <span className="font-medium">{c.user.name}</span>{" "}
                  <span className="text-xs text-gray-500">
                    {dayjs(c.created_at).fromNow()}
                  </span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {c.text}
                  {session?.user?.role === 'admin' && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="ml-1 text-red-500 hover:text-red-600"
                    >
                      <XMarkIcon className="inline h-4 w-4" />
                    </button>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {c.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => toggleReaction(c.id, r.emoji, r.reacted)}
                      className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 bg-gray-100 dark:bg-zinc-700 ${r.reacted ? 'font-semibold' : ''}`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  ))}
                  {emojiActive && (
                    <div className="relative">
                      <button
                        onClick={() => setPickerFor(pickerFor === c.id ? null : c.id)}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        😃
                      </button>
                      {pickerFor === c.id && (
                        <div className="absolute z-10 mt-1 flex gap-1 rounded-md bg-white dark:bg-zinc-800 p-1 shadow">
                          {['😆','😂','😍','😡','😢','😲','🎉','🥺'].map(e => (
                            <button
                              key={e}
                              onClick={() => { setPickerFor(null); sendReaction(c.id, e, false); }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {visible < comments.length && (
        <button
          onClick={() => setVisible(comments.length)}
          className="mt-2 text-xs text-indigo-500 hover:underline"
        >
          További hozzászólások
        </button>
      )}
      <div className="relative mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Írj hozzászólást..."
          className="w-full rounded-md border border-gray-300 bg-white dark:bg-zinc-800 p-2 pr-8 text-sm focus:outline-none"
          maxLength={500}
        />
        <button
          onClick={submit}
          className="absolute bottom-1.5 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
