"use client"

import { motion } from "framer-motion"

export type FeedItemData = {
  id: string
  title: string
  type: "image" | "music" | "prompt"
  r2_url: string
  created_at: string
}

export default function FeedItem({ item }: { item: FeedItemData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-white dark:bg-zinc-900 p-4 shadow"
      whileHover={{ scale: 1.02 }}
    >
      {item.type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.r2_url} alt={item.title} className="mb-2 w-full rounded" />
      )}
      {item.type === "music" && (
        <audio controls src={item.r2_url} className="mb-2 w-full" />
      )}
      {item.type === "prompt" && (
        <pre className="mb-2 whitespace-pre-wrap text-sm">{item.title}</pre>
      )}
      {item.type !== "prompt" && (
        <p className="text-sm font-medium">{item.title}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(item.created_at).toLocaleDateString()}
      </p>
    </motion.div>
  )
}
