import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'
import { BADGE_DEFINITIONS } from '@/constants'

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext()
  const { searchParams } = new URL(req.url)
  let page = parseInt(searchParams.get('page') || '1', 10)
  if (Number.isNaN(page) || page < 1) page = 1
  let limit = parseInt(searchParams.get('limit') || '20', 10)
  if (Number.isNaN(limit) || limit < 10) limit = 10
  if (limit > 20) limit = 20
  const offset = (page - 1) * limit

  const result = await env.DB.prepare(`
      SELECT u.id, u.title, u.url, u.r2_key, u.created_at,
             usr.nickname, usr.email,
             (SELECT badge_key FROM user_badges WHERE user_id = usr.id ORDER BY awarded_at LIMIT 1) as badge_key,
             COUNT(f.id) AS likes
        FROM uploads u
        JOIN user usr ON u.user_id = usr.id
        LEFT JOIN favorites f ON u.id = f.upload_id AND f.created_at >= datetime('now', '-7 day')
       WHERE u.visibility = 'public'
         AND u.approved = 1
         AND u.moderation_status = 'approved'
         AND u.type = 'image'
       GROUP BY u.id
       ORDER BY likes DESC, u.created_at DESC
       LIMIT ?1 OFFSET ?2
    `).bind(limit, offset).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const base = publicBase ? (publicBase.endsWith('/') ? publicBase : `${publicBase}/`) : null

  const items = await Promise.all(
    (result.results || []).map(async row => {
      let url = row.url
      if (row.r2_key) {
        if (publicBase) {
          url = `${base}${row.r2_key}`
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
          url = await getSignedUrl(env.yumekai_r2, row.r2_key)
        }
      }
      return {
        id: row.id,
        title: row.title,
        url,
        created_at: row.created_at,
        author: row.nickname || row.email,
        badge: row.badge_key
          ? {
              icon: BADGE_DEFINITIONS[row.badge_key as keyof typeof BADGE_DEFINITIONS].icon,
              name: BADGE_DEFINITIONS[row.badge_key as keyof typeof BADGE_DEFINITIONS].name,
              description: BADGE_DEFINITIONS[row.badge_key as keyof typeof BADGE_DEFINITIONS].description,
            }
          : undefined,
        is_nsfw: false,
      }
    })
  )

  return jsonResponse({ items, page, limit })
}
