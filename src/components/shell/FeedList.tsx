"use client"

import FeedCard, { type FeedPost } from "./FeedCard"

const posts: FeedPost[] = [
  {
    id: "1",
    name: "Surfiya Zakir",
    time: "22 min ago",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus quis luctus orci.",
    image: "https://source.unsplash.com/random/800x400?sig=11",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "2",
    name: "Tomas Laur",
    time: "1 hr ago",
    text: "Vivamus euismod, dolor in interdum cursus, justo massa dapibus nisl, ut aliquet lorem nulla eu nisi.",
    image: "https://source.unsplash.com/random/800x400?sig=12",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
]

export default function FeedList() {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <FeedCard key={post.id} post={post} />
      ))}
    </div>
  )
}
