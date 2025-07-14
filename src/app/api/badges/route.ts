import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const { env } = getCloudflareContext()
  const session = await getSessionFromCookie()
  const rows = await env.DB.prepare(
    `SELECT b.id, b.slug, b.name, b.description, b.icon_url, b.category,
            CASE WHEN ub.id IS NULL THEN 0 ELSE 1 END AS earned
     FROM badges b
     LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = ?1
     ORDER BY b.created_at ASC`
  ).bind(session?.user?.id ?? null).all<Record<string, unknown>>()

  return jsonResponse({ badges: rows.results })
}
