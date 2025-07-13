"use client"

import PostCard from "./PostCard"
import type { FeedItem } from "./CommunityFeedV3"

const demo: FeedItem = {
  id: "demo1",
  title: "Demo poszt",
  type: "image",
  url: "https://placekitten.com/400/300",
  created_at: new Date().toISOString(),
  user: { name: "Demo User", email: "demo@example.com" },
}

export default function PostWithInteractionPreview() {
  return <PostCard item={demo} audioRef={{ current: null }} playingId={null} setPlayingId={() => {}} />
}
