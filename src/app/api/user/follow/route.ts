import { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { createId } from '@paralleldrive/cuid2'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare('SELECT followee_id FROM user_follows WHERE follower_id = ?1')
    .bind(session.user.id)
    .all<{ followee_id: string }>()
  const following = (rows.results || []).map(r => r.followee_id)
  return jsonResponse({ success: true, following })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json() as { userId: string; action?: 'unfollow' }
  if (!body.userId) {
    return jsonResponse({ success: false, error: 'Missing userId' }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  if (body.action === 'unfollow') {
    await env.DB.prepare('DELETE FROM user_follows WHERE follower_id = ?1 AND followee_id = ?2')
      .bind(session.user.id, body.userId)
      .run()
  } else {
    await env.DB.prepare('INSERT OR IGNORE INTO user_follows (id, follower_id, followee_id) VALUES (?1, ?2, ?3)')
      .bind(`fol_${createId()}`, session.user.id, body.userId)
      .run()
  }
  return jsonResponse({ success: true })
}
