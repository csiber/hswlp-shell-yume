import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
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
  const session = await getSessionFromCookie()
  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?1'
  ).bind(id).first<{ count: number }>()
  const likedRow = session?.user?.id
    ? await env.DB.prepare(
        'SELECT 1 FROM post_likes WHERE post_id = ?1 AND user_id = ?2 LIMIT 1'
      ).bind(id, session.user.id).first()
    : null
  return jsonResponse({ count: countRow?.count || 0, liked: Boolean(likedRow) })
}

