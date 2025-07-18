import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ uploads: [] })
  }

  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(
    'SELECT id, title, type, url, created_at FROM uploads WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(session.user.id).all<Record<string, string>>()

  return jsonResponse({ uploads: result.results || [] })
}
