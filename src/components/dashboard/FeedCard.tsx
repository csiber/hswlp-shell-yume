"use client"


export interface FeedPost {
  id: string
  name: string
  time: string
  text: string
  image: string
  avatar: string
}

export default function FeedCard({ post }: { post: FeedPost }) {
  return (
    <div className="rounded-xl bg-white shadow dark:bg-gray-800">
      <div className="flex items-center gap-3 p-4">

        <div>
          <div className="font-semibold">{post.name}</div>
          <div className="text-xs text-muted-foreground">{post.time}</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="mb-4 text-sm">{post.text}</p>
        {post.image && (
          <div className="overflow-hidden rounded-lg">

          </div>
        )}
      </div>
    </div>
  )
}
