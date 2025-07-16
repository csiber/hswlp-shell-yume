"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Comment {
  id: string;
  text: string;
  created_at: string;
  user: { name: string; avatar?: string };
}

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [visible, setVisible] = useState(2);
  const [text, setText] = useState("");

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

  async function submit() {
    if (!text.trim() || text.length > 500) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { comment: Comment };
      setComments((c) => [...c, data.comment]);
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
                <p className="text-gray-700 dark:text-gray-300">{c.text}</p>
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
