"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/state/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

dayjs.extend(relativeTime);
dayjs.locale("en");

interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

interface Comment {
  id: string
  text: string
  created_at: string
  user: { name: string; avatar?: string; badge?: { icon: string; name: string; description: string } }
  reactions: Reaction[]
}

export default function CommentList({ postId, isGuest = false }: { postId: string; isGuest?: boolean }) {
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
    if (isGuest) return;
    sendReaction(commentId, emoji, reacted);
  }

  async function deleteComment(commentId: string) {
    if (isGuest) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setComments(cs => cs.filter(c => c.id !== commentId));
    } catch {
      // ignore
    }
  }

  async function submit() {
    if (isGuest) return;
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
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {comments.slice(0, visible).map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 text-sm opacity-70"
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
                <p className="leading-none flex items-center gap-1">
                  <span className="font-medium">{c.user.name}</span>
                  {c.user.badge && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm cursor-default">{c.user.badge.icon}</span>
                        </TooltipTrigger>
                        <TooltipContent>{`${c.user.badge.name} – ${c.user.badge.description}`}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <span className="text-xs text-gray-500">
                    {dayjs(c.created_at).fromNow()}
                  </span>
                </p>
                <p>
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
                      disabled={isGuest}
                      className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 bg-gray-100 dark:bg-zinc-700 ${r.reacted ? 'font-semibold' : ''} ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  ))}
                  {emojiActive && (
                    <div className="relative">
                      <button
                        onClick={() => setPickerFor(pickerFor === c.id ? null : c.id)}
                        disabled={isGuest}
                        className={`rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        😃
                      </button>
                      {pickerFor === c.id && !isGuest && (
                        <div className="absolute z-10 mt-1 flex gap-1 rounded-md bg-white dark:bg-zinc-800 p-1 shadow">
                          {['😆','😂','😍','😡','😢','😲','🎉','🥺'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setPickerFor(null)
                                sendReaction(c.id, emoji, false)
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                            >
                              {emoji}
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
          className="mt-2 text-xs text-indigo-400 hover:underline"
        >
          View all comments
        </button>
      )}
      {comments.length > 0 && (
        <div className="mt-1 flex w-full items-center gap-2 border-b bg-transparent px-2 h-8 focus-within:bg-black/10">
          {!isGuest && (
            <Avatar className="h-6 w-6">
              {session?.user?.avatar && (
                <AvatarImage src={session.user.avatar} alt={session.user.nickname || session.user.email} />
              )}
              <AvatarFallback>
                {(session?.user?.nickname || session?.user?.email || 'U').slice(0,2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={isGuest ? 'Login required' : 'Write a comment...'}
            className="h-8 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/70 focus:outline-none"
            maxLength={500}
            disabled={isGuest}
          />
          <button
            onClick={submit}
            disabled={isGuest}
            className={`text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
