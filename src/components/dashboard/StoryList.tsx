"use client"

import Image from "next/image"

const stories = [
  { id: "add", name: "Add Story", image: "", avatar: "" },
  { id: "1", name: "Surfiya Zakir", image: "https://source.unsplash.com/random/200x200?sig=1", avatar: "https://i.pravatar.cc/150?img=32" },
  { id: "2", name: "Rashed Ka", image: "https://source.unsplash.com/random/200x200?sig=2", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: "3", name: "Fawzan Ali", image: "https://source.unsplash.com/random/200x200?sig=3", avatar: "https://i.pravatar.cc/150?img=65" },
  { id: "4", name: "Milan Nep", image: "https://source.unsplash.com/random/200x200?sig=4", avatar: "https://i.pravatar.cc/150?img=47" },
]

export default function StoryList() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stories.map((story) => (
        story.id === "add" ? (
          <div
            key={story.id}
            className="flex h-32 w-24 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed bg-muted text-sm font-semibold text-muted-foreground dark:bg-gray-800"
          >
            + Add Story
          </div>
        ) : (
          <div key={story.id} className="relative h-32 w-24 flex-shrink-0">
            <Image
              src={story.image}
              alt={story.name}
              fill
              className="rounded-xl object-cover"
            />
            <div className="absolute inset-0 rounded-xl bg-black/20" />
            <div className="absolute bottom-1 left-1 right-1 truncate text-center text-xs font-semibold text-white drop-shadow">
              {story.name}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <Image
                src={story.avatar}
                alt={story.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-white"
              />
            </div>
          </div>
        )
      ))}
    </div>
  )
}
