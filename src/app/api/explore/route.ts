import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'

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
             usr.nickname, usr.email
        FROM uploads u
        JOIN user usr ON u.user_id = usr.id
       WHERE u.visibility = 'public'
         AND u.approved = 1
         AND u.moderation_status = 'approved'
         AND u.type = 'image'
       ORDER BY u.created_at DESC
       LIMIT ?1 OFFSET ?2
    `).bind(limit, offset).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const base = publicBase
    ? publicBase.endsWith('/')
      ? publicBase
      : `${publicBase}/`
    : null

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

  return jsonResponse({ items, page, limit })
}
