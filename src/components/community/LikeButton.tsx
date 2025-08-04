"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
  postId: string
  isGuest?: boolean
}

export default function LikeButton({ postId, isGuest = false }: Props) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/posts/${postId}/likes`)
        if (!res.ok) return
        const data = (await res.json()) as { count: number; liked: boolean }
        setCount(data.count)
        setLiked(data.liked)
      } catch {
        // ignore
      }
    }
    load()
  }, [postId])

  async function toggle() {
    if (isGuest) return
    try {
      if (liked) {
        const res = await fetch(`/api/posts/${postId}/unlike`, { method: "DELETE" })
        if (!res.ok) return
        await fetch('/api/favorite', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id: postId }),
        })
        setLiked(false)
        setCount((c) => c - 1)
      } else {
        const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" })
        if (!res.ok) return
        await fetch('/api/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id: postId }),
        })
        setLiked(true)
        setCount((c) => c + 1)
      }
    } catch {
      // ignore
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={toggle}
            disabled={isGuest}
            className={`flex items-center gap-1 p-1 text-sm opacity-50 hover:opacity-100 transition-opacity ${isGuest ? 'cursor-not-allowed' : ''}`}
          >
            {liked ? (
              <motion.span
                key="liked"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.3 }}
              >
                <HeartSolid className="h-4 w-4 text-red-500" />
              </motion.span>
            ) : (
              <HeartOutline className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            )}
            <motion.span
              key={count}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {count}
            </motion.span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          {isGuest ? 'Login required' : liked ? 'Unlike' : 'Like'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
