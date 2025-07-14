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
}

export default function LikeButton({ postId }: Props) {
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
    try {
      if (liked) {
        const res = await fetch(`/api/posts/${postId}/unlike`, { method: "DELETE" })
        if (!res.ok) return
        setLiked(false)
        setCount((c) => c - 1)
      } else {
        const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" })
        if (!res.ok) return
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
            className="flex items-center gap-1 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {liked ? (
              <HeartSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartOutline className="h-5 w-5" />
            )}
            <span>{count}</span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          {liked ? "Mégse tetszik" : "Tetszik"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
