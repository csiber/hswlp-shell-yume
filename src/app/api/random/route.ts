import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

export async function GET() {
  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(`
      SELECT u.id, u.title, u.url, u.r2_key, u.created_at,
             usr.nickname, usr.email
        FROM uploads u
        JOIN user usr ON u.user_id = usr.id
       WHERE u.visibility = 'public'
         AND u.approved = 1
         AND u.moderation_status = 'approved'
         AND u.type = 'image'
       ORDER BY RANDOM()
       LIMIT 20
    `).all<Record<string, string>>()

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
        is_nsfw: false,
      }
    })
  )

  return jsonResponse({ items })
}
