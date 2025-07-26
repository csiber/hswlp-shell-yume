import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ items: [] }, { status: 401 })
  }

  const { env } = getCloudflareContext()

  const kv = env.NEXT_INC_CACHE_KV
  if (!kv) {
    throw new Error('Nem sikerült csatlakozni a KV tárhoz')
  }
  const { searchParams } = new URL(req.url)
  let page = parseInt(searchParams.get('page') || '1', 10)
  if (Number.isNaN(page) || page < 1) page = 1
  let limit = parseInt(searchParams.get('limit') || '20', 10)
  if (Number.isNaN(limit) || limit <= 0) limit = 20
  if (limit > 50) limit = 50
  const offset = (page - 1) * limit
  const feedCacheKey = page === 1 ? `feed_latest:${limit}` : null
  const pinnedCacheKey = `user:${session.user.id}:pinned`

  let rows: Record<string, string>[] | null = null
  let pinnedItem: Record<string, string> | null | undefined = undefined

  if (feedCacheKey) {
    const cachedFeed = await kv.get(feedCacheKey)
    if (cachedFeed) {
      rows = JSON.parse(cachedFeed) as Record<string, string>[]
    }
  }

  const cachedPinned = page === 1 ? await kv.get(pinnedCacheKey) : null
  if (cachedPinned !== null) {
    pinnedItem = cachedPinned === 'null' ? null : (JSON.parse(cachedPinned) as Record<string, string>)
  }

  if (!rows) {
    const result = await env.DB.prepare(
      `SELECT u.id, u.title, u.type, u.created_at, u.url, usr.nickname
         FROM uploads u
         JOIN user usr ON u.user_id = usr.id
        WHERE u.approved = 1 AND u.visibility = 'public'
        ORDER BY u.created_at DESC
        LIMIT ?1 OFFSET ?2`
    )
      .bind(limit, offset)
      .all<Record<string, string>>()
    rows = result.results || []
    if (feedCacheKey) {
      await kv.put(feedCacheKey, JSON.stringify(rows), { expirationTtl: 60 })
    }
  }
  
  if (page === 1 && pinnedItem === undefined) {
    const pinnedRow = await env.DB.prepare(
      'SELECT pinned_post_id FROM user WHERE id = ?1 LIMIT 1'
    ).bind(session.user.id).first<{ pinned_post_id: string | null }>()

    if (pinnedRow?.pinned_post_id) {
      pinnedItem = await env.DB.prepare(
        `SELECT u.id, u.title, u.type, u.created_at, u.url, usr.nickname
           FROM uploads u
           JOIN user usr ON u.user_id = usr.id
          WHERE u.id = ?1 AND u.approved = 1 AND u.visibility = 'public'
          LIMIT 1`
      ).bind(pinnedRow.pinned_post_id).first<Record<string, string>>() || null
    } else {
      pinnedItem = null
    }
    await kv.put(pinnedCacheKey, JSON.stringify(pinnedItem), { expirationTtl: 60 })
  }

  const items = [] as {
    id: string
    title: string
    tags: string | null
    type: 'image' | 'music' | 'prompt'
    url: string
    download_points: number
    created_at: string
    view_count: number
    play_count: number
    user: { name: string | null; email: string }
    pinned?: boolean
  }[]

  const rowsList = [...(rows || [])]
  if (page === 1 && pinnedItem) {
    const idx = rowsList.findIndex(r => r.id === pinnedItem!.id)
    if (idx !== -1) rowsList.splice(idx, 1)
    rowsList.unshift(pinnedItem)
  }

  for (const row of rowsList) {
    const fileUrl = row.url
    const displayName = row.nickname || `Anon${row.id?.slice(-4)}`
    items.push({
      id: row.id,
      title: row.title,
      tags: null,
      type: row.type as 'image' | 'music' | 'prompt',
      url: fileUrl,
      download_points: 2,
      created_at: new Date(row.created_at).toISOString(),
      view_count: 0,
      play_count: 0,
      user: {
        name: displayName,
        email: '',
      },
      pinned: page === 1 && pinnedItem ? row.id === pinnedItem.id : false,
    })
  }

  return jsonResponse({ items, page, limit })
}
