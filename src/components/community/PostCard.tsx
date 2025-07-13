"use client"

import { motion } from "framer-motion"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import MusicPlayer from "./MusicPlayer"
import PromptBox from "./PromptBox"
import {
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  ShareIcon,
} from "@heroicons/react/24/outline"
import type { FeedItem } from "./CommunityFeedV3"

dayjs.extend(relativeTime)

interface PostCardProps {
  item: FeedItem
  audioRef: React.RefObject<HTMLAudioElement>
  playingId: string | null
  setPlayingId: (id: string | null) => void
}

export default function PostCard({
  item,
  audioRef,
  playingId,
  setPlayingId,
}: PostCardProps) {
  const initials =
    item.user.name?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || item.user.email.slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">
            {item.user.name || item.user.email}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {dayjs(item.created_at).fromNow()}
        </span>
      </div>
      <div className="mb-2">
        {item.type === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.title}
            className="w-full rounded-xl object-cover"
          />
        )}
        {item.type === "music" && (
          <MusicPlayer
            id={item.id}
            url={item.url}
            title={item.title}
            audioRef={audioRef}
            playingId={playingId}
            setPlayingId={setPlayingId}
          />
        )}
        {item.type === "prompt" && <PromptBox text={item.title} />}
      </div>
      {item.type !== "prompt" && (
        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
          {item.title}
        </p>
      )}
      <div className="mt-auto flex justify-between text-gray-500">
        <button className="flex items-center gap-1 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
          <HeartIcon className="h-5 w-5" /> Like
        </button>
        <button className="flex items-center gap-1 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5" /> Comment
        </button>
        <button className="flex items-center gap-1 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
          <ShareIcon className="h-5 w-5" /> Share
        </button>
      </div>
    </motion.div>
  )
}

