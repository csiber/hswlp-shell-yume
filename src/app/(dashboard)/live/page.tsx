import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import LivePageClient from './live.client'

export const metadata: Metadata = {
  title: 'Live közvetítés',
}

export default async function LivePage() {
  const session = await getSessionFromCookie()
  if (!session) {
    return redirect('/')
  }

  return <LivePageClient />
}
