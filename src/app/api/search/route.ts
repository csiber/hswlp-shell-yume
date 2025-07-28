import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext()
  const { searchParams } = new URL(req.url)
  const term = searchParams.get('q')
  const tag = searchParams.get('tag')
  let page = parseInt(searchParams.get('page') || '1', 10)
  if (Number.isNaN(page) || page < 1) page = 1
  let limit = parseInt(searchParams.get('limit') || '20', 10)
  if (Number.isNaN(limit) || limit < 10) limit = 10
  if (limit > 20) limit = 20
  const offset = (page - 1) * limit

  const conditions = [
    "u.visibility = 'public'",
    "u.approved = 1",
    "u.moderation_status = 'approved'",
    "u.type = 'image'"
  ]
  const params: unknown[] = []
  if (term) {
    conditions.push('(u.title LIKE ? OR u.description LIKE ? OR u.tags LIKE ?)')
    const like = `%${term}%`
    params.push(like, like, like)
  }
  if (tag) {
    conditions.push('u.tags LIKE ?')
    params.push(`%${tag}%`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const query = `
    SELECT u.id, u.title, u.url, u.r2_key, u.created_at, usr.nickname, usr.email
      FROM uploads u
      JOIN user usr ON u.user_id = usr.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?`
  const rows = await env.DB.prepare(query).bind(...params, limit, offset).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const base = publicBase ? (publicBase.endsWith('/') ? publicBase : `${publicBase}/`) : null
  const items = await Promise.all((rows.results || []).map(async row => {
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
  }))

  return jsonResponse({ items, page, limit })
}
