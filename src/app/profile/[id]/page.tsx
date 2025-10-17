import { notFound } from 'next/navigation'
import { getSessionFromCookie } from '@/utils/auth'
import ProfileClient from './profile-client'

interface ApiResponse {
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
    credits: number
    profileFrameEnabled: boolean
    points: number
  }
  uploads: {
    id: string
    type: 'image' | 'music' | 'prompt'
    url: string
    name: string
    created_at: string
    download_points: number
  }[]
  badges: {
    key: string
    name: string
    description: string
    icon: string
    awarded_at: string
  }[]
  stats: {
    monthlyUploads: { month: string; count: number }[]
    engagement: { totalLikes: number; totalReactions: number }
    points: {
      total: number
      level: number
      currentLevelThreshold: number
      nextLevelThreshold: number | null
      progress: number
      history: { date: string; points: number }[]
    }
  }
  badgeOverview: {
    upcoming: {
      key: string
      name: string
      description: string
      icon: string
    }[]
  }
}

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const session = await getSessionFromCookie()
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/profile/${id}`, {
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
      badges={data.badges}
      stats={data.stats}
      badgeOverview={data.badgeOverview}
      currentUserId={session?.user?.id}
    />
  )
}
