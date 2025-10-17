import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { BADGE_DEFINITIONS } from '@/constants'
import { NextRequest } from 'next/server'

interface RouteContext<T> {
  params: Promise<T>
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id } = await params
  const { env } = getCloudflareContext()
  const user = await env.DB.prepare(
    'SELECT id, nickname, email, avatar, currentCredits, profile_frame_enabled, points FROM user WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{
    id: string
    nickname: string | null
    email: string
    avatar: string | null
    currentCredits: number | null
    profile_frame_enabled: number | null
    points: number | null
  }>()

  if (!user) {
    return new Response('Not found', { status: 404 })
  }

  const uploads = await env.DB.prepare(
    'SELECT id, title, type, url, r2_key, created_at, download_points FROM uploads WHERE user_id = ?1 ORDER BY created_at DESC'
  ).bind(id).all<{
    id: string; title: string; type: string; url: string; r2_key: string; created_at: string; download_points: number | null
  }>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
const items = [] as {
  id: string
  type: 'image' | 'music' | 'prompt'
  url: string
  name: string
  created_at: string
  download_points: number
}[]


  for (const row of uploads.results || []) {
    let fileUrl: string
    if (publicBase && row.r2_key) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (row.r2_key && typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.yumekai_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }
    items.push({
      id: row.id,
      type: row.type as 'image' | 'music' | 'prompt',
      url: fileUrl,
      name: row.title,
      created_at: new Date(row.created_at).toISOString(),
      download_points: row.download_points ?? 2,
    })
  }

  const badgeRows = await env.DB.prepare(
    'SELECT badge_key, awarded_at FROM user_badges WHERE user_id = ?1 ORDER BY awarded_at'
  ).bind(id).all<{ badge_key: string; awarded_at: string }>()

  const badges = (badgeRows.results || []).map(r => ({
    key: r.badge_key,
    name: BADGE_DEFINITIONS[r.badge_key as keyof typeof BADGE_DEFINITIONS].name,
    description: BADGE_DEFINITIONS[r.badge_key as keyof typeof BADGE_DEFINITIONS].description,
    icon: BADGE_DEFINITIONS[r.badge_key as keyof typeof BADGE_DEFINITIONS].icon,
    awarded_at: r.awarded_at,
  }))

  const monthlyUploadRows = await env.DB.prepare(
    "SELECT strftime('%Y-%m', created_at) as period, COUNT(*) as count FROM uploads WHERE user_id = ?1 GROUP BY period ORDER BY period DESC LIMIT 12"
  ).bind(id).all<{ period: string; count: number }>()

  const uploadsByMonth = new Map<string, number>()
  for (const row of monthlyUploadRows.results || []) {
    uploadsByMonth.set(row.period, Number(row.count) || 0)
  }

  const months: { month: string; count: number }[] = []
  const current = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(current.getFullYear(), current.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push({ month: key, count: uploadsByMonth.get(key) ?? 0 })
  }

  const likesRow = await env.DB.prepare(
    'SELECT COUNT(pl.id) as count FROM post_likes pl JOIN posts p ON pl.post_id = p.id WHERE p.user_id = ?1'
  ).bind(id).first<{ count: number | null }>()

  const reactionsRow = await env.DB.prepare(
    'SELECT COUNT(cr.id) as count FROM comment_reactions cr JOIN comments c ON cr.comment_id = c.id WHERE c.user_id = ?1'
  ).bind(id).first<{ count: number | null }>()

  const LEVELS = [
    { level: 1, threshold: 0 },
    { level: 2, threshold: 100 },
    { level: 3, threshold: 250 },
    { level: 4, threshold: 500 },
    { level: 5, threshold: 800 },
    { level: 6, threshold: 1200 },
    { level: 7, threshold: 1700 },
  ] as const

  const totalPoints = user.points ?? 0
  let currentLevel = LEVELS[0]
  let nextLevel: (typeof LEVELS)[number] | null = null

  for (const level of LEVELS) {
    if (totalPoints >= level.threshold) {
      currentLevel = level
    } else {
      nextLevel = level
      break
    }
  }

  const currentLevelThreshold = currentLevel.threshold
  const nextLevelThreshold = nextLevel?.threshold ?? null
  const levelRange = nextLevelThreshold ? nextLevelThreshold - currentLevelThreshold : 1
  const pointsIntoLevel = totalPoints - currentLevelThreshold
  const levelProgress = nextLevelThreshold ? Math.min(Math.max(pointsIntoLevel / levelRange, 0), 1) : 1

  const pointsHistoryRows = await env.DB.prepare(
    "SELECT strftime('%Y-%m-%d', created_at) as day, SUM(points_awarded) as points FROM upload_rewards WHERE uploader_id = ?1 GROUP BY day ORDER BY day ASC LIMIT 90"
  ).bind(id).all<{ day: string; points: number | null }>()

  const pointsHistory = (pointsHistoryRows.results || []).map(row => ({
    date: row.day,
    points: Number(row.points) || 0,
  }))

  const upcomingBadges = Object.entries(BADGE_DEFINITIONS)
    .filter(([key]) => !badges.some(b => b.key === key))
    .map(([key, value]) => ({
      key,
      name: value.name,
      description: value.description,
      icon: value.icon,
    }))

  const displayName = user.nickname || `Anon${user.id.slice(-4)}`
  return jsonResponse({
    user: {
      id: user.id,
      name: displayName,
      email: user.email,
      avatar: user.avatar,
      credits: user.currentCredits ?? 0,
      profileFrameEnabled: !!user.profile_frame_enabled,
      points: totalPoints,
    },
    uploads: items,
    badges,
    stats: {
      monthlyUploads: months,
      engagement: {
        totalLikes: Number(likesRow?.count) || 0,
        totalReactions: Number(reactionsRow?.count) || 0,
      },
      points: {
        total: totalPoints,
        level: currentLevel.level,
        currentLevelThreshold,
        nextLevelThreshold,
        progress: levelProgress,
        history: pointsHistory,
      },
    },
    badgeOverview: {
      earned: badges,
      upcoming: upcomingBadges,
    },
  })
}
