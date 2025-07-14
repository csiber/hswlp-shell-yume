"use client"

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

export interface ChatMessageData {
  id: string
  content: string
  created_at: string
  user: {
    name: string
  }
}

dayjs.extend(relativeTime)

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  return (
    <div className="flex flex-col">
      <span className="mb-1 text-xs text-gray-500 dark:text-gray-400">
        {message.user.name} – {dayjs(message.created_at).fromNow()}
      </span>
      <div className="max-w-fit rounded-lg bg-gray-200 dark:bg-zinc-700 px-3 py-2 text-sm">
        {message.content}
      </div>
    </div>
  )
}
