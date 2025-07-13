"use client"

import Image from "next/image"

export default function CreatePostBox() {
  return (
    <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <Image
          src="https://i.pravatar.cc/150?img=32"
          alt="User avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
        <input
          type="text"
          placeholder="What's on your mind?"
          className="flex-1 rounded-full bg-muted px-4 py-2 text-sm focus:outline-none dark:bg-gray-700"
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <button className="flex items-center justify-center gap-1 rounded-md bg-muted py-2 font-medium text-muted-foreground hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
          Live Video
        </button>
        <button className="flex items-center justify-center gap-1 rounded-md bg-muted py-2 font-medium text-muted-foreground hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
          Photo/Video
        </button>
        <button className="flex items-center justify-center gap-1 rounded-md bg-muted py-2 font-medium text-muted-foreground hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
          Feeling/Activity
        </button>
      </div>
    </div>
  )
}
