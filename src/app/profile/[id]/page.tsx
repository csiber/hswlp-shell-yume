import { notFound } from 'next/navigation'
import { getSessionFromCookie } from '@/utils/auth'
import ProfileClient from './profile-client'

interface ApiResponse {
  user: { id: string; name: string; email: string; avatar?: string | null; credits: number }
  uploads: {
    id: string
    type: 'image' | 'music' | 'prompt'
    url: string
    name: string
    created_at: string
  }[]
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getSessionFromCookie()
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/profile/${params.id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    if (res.status === 404) return notFound()
    throw new Error('Failed to load profile')
  }

  const data = (await res.json()) as ApiResponse

  return (
    <ProfileClient
      user={data.user}
      uploads={data.uploads}
      currentUserId={session?.user?.id}
    />
  )
}
