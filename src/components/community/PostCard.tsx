"use client"

import { motion } from "framer-motion"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MusicPlayer from "./MusicPlayer"
import PromptBox from "./PromptBox"
import ImageLightbox from "@/components/ui/ImageLightbox"
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js"
import { useEffect, useState } from "react"
import { ShareIcon } from "@heroicons/react/24/outline"
import LikeButton from "./LikeButton"
import CommentList from "./CommentList"
import type { FeedItem } from "./CommunityFeedV3"

dayjs.extend(relativeTime)

interface PostCardProps {
  item: FeedItem
  audioRef: React.RefObject<HTMLAudioElement | null>
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

  const [promptText, setPromptText] = useState<string | null>(null)
  const [promptError, setPromptError] = useState<boolean>(false)

  const [musicMeta, setMusicMeta] = useState<{
    title: string
    artist: string
    album?: string
    picture?: string
  } | null>(null)

  useEffect(() => {
    if (item.type === "prompt") {
      fetch(item.url)
        .then((res) => res.text())
        .then((txt) => setPromptText(txt))
        .catch(() => setPromptError(true))
    }

    if (item.type === "music") {
      new jsmediatags.Reader(item.url).read({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (info: any) => {
          const tags = info.tags
          let picture
          if (tags.picture) {
            const { data, format } = tags.picture
            const byteArray = new Uint8Array(data)
            let binary = ""
            byteArray.forEach((b) => (binary += String.fromCharCode(b)))
            picture = `data:${format};base64,${btoa(binary)}`
          }
          setMusicMeta({
            title: tags.title || item.title || "Ismeretlen szám",
            artist: tags.artist || "Ismeretlen előadó",
            album: tags.album,
            picture,
          })
        },
        onError: () =>
          setMusicMeta({
            title: item.title || "Ismeretlen szám",
            artist: "Ismeretlen előadó",
          }),
      })
    }
  }, [item])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col w-full max-w-md mx-auto rounded-2xl border bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900 p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {item.user.avatar_url && (
            <AvatarImage src={item.user.avatar_url} alt={item.user.name || item.user.email} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              {item.user.name || item.user.email}
            </span>
            <span className="text-muted-foreground">
              {item.type === 'music' ? '🎵' : item.type === 'prompt' ? '💬' : '🖼'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {dayjs(item.created_at).fromNow()}
          </span>
        </div>
      </div>
      <div className="mb-2">
        {item.type === "image" && (
          <ImageLightbox src={item.url} alt={item.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full rounded-xl object-cover"
            />
          </ImageLightbox>
        )}
        {item.type === "music" && (
          <div className="flex flex-col items-center gap-2">
            {musicMeta?.picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={musicMeta.picture}
                alt={musicMeta.title}
                className="rounded-md w-24 h-24 object-cover"
              />
            )}
            <div className="text-center text-sm">
              <p>{musicMeta?.title || item.title || "Ismeretlen szám"}</p>
              <p className="text-xs text-gray-500">
                {musicMeta?.artist || "Ismeretlen előadó"}
              </p>
            </div>
            <MusicPlayer
              id={item.id}
              url={item.url}
              title={musicMeta?.title || item.title || "Ismeretlen szám"}
              audioRef={audioRef}
              playingId={playingId}
              setPlayingId={setPlayingId}
            />
          </div>
        )}
        {item.type === "prompt" && (
          <PromptBox
            text={promptError ? "A prompt nem olvasható" : promptText || ""}
          />
        )}
      </div>
      {item.type !== "prompt" && (
        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
          {item.title}
        </p>
      )}
      <div className="mt-auto flex justify-between text-gray-500 relative">
        <button className="flex items-center gap-1 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
          <ShareIcon className="h-5 w-5" /> Share
        </button>
        <div className="absolute right-0 bottom-0">
          <LikeButton postId={item.id} />
        </div>
      </div>
      <CommentList postId={item.id} />
    </motion.div>
  )
}

