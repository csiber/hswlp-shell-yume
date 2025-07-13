"use client"

import Image from "next/image"

const stories = [
  { id: "add", name: "Add Story", image: "#", avatar: "#" },
  { id: "1", name: "Surfiya Zakir", image: "#", avatar: "#" }
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

            <div className="absolute inset-0 rounded-xl bg-black/20" />
            <div className="absolute bottom-1 left-1 right-1 truncate text-center text-xs font-semibold text-white drop-shadow">
              {story.name}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">

            </div>
          </div>
        )
      ))}
    </div>
  )
}
