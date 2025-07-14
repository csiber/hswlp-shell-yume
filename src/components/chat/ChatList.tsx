"use client"

import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import ChatMessage, { ChatMessageData } from './ChatMessage'

interface ChatListResponse {
  messages: ChatMessageData[]
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<ChatListResponse>)

export default function ChatList() {
  const { data, mutate } = useSWR<ChatListResponse>('/api/chat', fetcher, {
    refreshInterval: 5000,
  })
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleRefresh() {
      mutate()
    }
    window.addEventListener('chat:refresh', handleRefresh)
    return () => window.removeEventListener('chat:refresh', handleRefresh)
  }, [mutate])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data])

  const messages = data?.messages ? [...data.messages].reverse() : []

  return (
    <div className="space-y-3 overflow-y-auto max-h-[60vh]">
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
