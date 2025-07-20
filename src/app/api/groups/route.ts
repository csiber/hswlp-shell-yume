import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const { env } = getCloudflareContext()
  const db = getDb(env, 'groups')
  const session = await getSessionFromCookie()
  const result = await db.prepare(`
    SELECT g.id, g.slug, g.name, g.description, g.cover_url,
           CASE WHEN gm.id IS NULL THEN 0 ELSE 1 END as is_member
    FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?1
    WHERE g.is_public = 1
    ORDER BY g.created_at DESC
  `).bind(session?.user?.id ?? null).all<Record<string, unknown>>()
  return jsonResponse({ groups: result.results })
}
