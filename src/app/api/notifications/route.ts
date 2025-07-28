import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare('SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 50')
    .bind(session.user.id)
    .all<Record<string, unknown>>()
  return jsonResponse({ success: true, notifications: rows.results || [] })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json() as { id: string }
  if (!id) return jsonResponse({ success: false, error: 'Missing id' }, { status: 400 })
  const { env } = getCloudflareContext()
  await env.DB.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?1 AND user_id = ?2')
    .bind(id, session.user.id).run()
  return jsonResponse({ success: true })
}
