import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import ChatList from '@/components/chat/ChatList'
import ChatBox from '@/components/chat/ChatBox'

export const metadata: Metadata = {
  title: 'Chat',
}

export default async function Page() {
  const session = await getSessionFromCookie()
  if (!session) {
    return redirect('/')
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Chat</h1>
      <div className="max-w-3xl mx-auto">
        <ChatList />
        <ChatBox />
      </div>
    </div>
  )
}
