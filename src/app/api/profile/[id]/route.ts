import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
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
    'SELECT id, nickname, email, avatar, currentCredits, profile_frame_enabled FROM user WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{
    id: string
    nickname: string | null
    email: string
    avatar: string | null
    currentCredits: number | null
    profile_frame_enabled: number | null
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

  const displayName = user.nickname || `Anon${user.id.slice(-4)}`
  return jsonResponse({
    user: {
      id: user.id,
      name: displayName,
      email: user.email,
      avatar: user.avatar,
      credits: user.currentCredits ?? 0,
      profileFrameEnabled: !!user.profile_frame_enabled,
    },
    uploads: items,
  })
}
