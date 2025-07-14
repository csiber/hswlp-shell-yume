import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

interface RouteContext<T> {
  params: Promise<T>
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id } = await params
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  await env.DB.prepare(
    'DELETE FROM post_likes WHERE post_id = ?1 AND user_id = ?2'
  ).bind(id, session.user.id).run()
  return jsonResponse({ success: true })
}

