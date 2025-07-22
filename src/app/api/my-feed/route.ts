import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ items: [] }, { status: 401 })
  }

  const { env } = getCloudflareContext()

  const pinnedRow = await env.DB.prepare(
    'SELECT pinned_post_id FROM user WHERE id = ?1 LIMIT 1'
  ).bind(session.user.id).first<{ pinned_post_id: string | null }>()

  let pinnedItem: Record<string, string> | null = null
  if (pinnedRow?.pinned_post_id) {
    pinnedItem = await env.DB.prepare(`
      SELECT u.id, u.title, u.tags, u.type, u.created_at, u.url, u.r2_key,
             u.view_count, u.play_count, u.download_points,
             usr.nickname, usr.email
        FROM uploads u
        JOIN user usr ON u.user_id = usr.id
       WHERE u.id = ?1 AND u.approved = 1 AND u.visibility = 'public'
       LIMIT 1
    `).bind(pinnedRow.pinned_post_id).first<Record<string, string>>()
  }

  const result = await env.DB.prepare(`
    SELECT u.id, u.title, u.tags, u.type, u.created_at, u.url, u.r2_key,
           u.view_count, u.play_count, u.download_points,
          usr.nickname, usr.email
    FROM uploads u
    JOIN user usr ON u.user_id = usr.id
    WHERE u.approved = 1 AND u.visibility = 'public'
    ORDER BY u.created_at DESC
    LIMIT 50
  `).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
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

  const rows = [...(result.results || [])]
  if (pinnedItem) {
    const idx = rows.findIndex(r => r.id === pinnedItem!.id)
    if (idx !== -1) rows.splice(idx, 1)
    rows.unshift(pinnedItem)
  }

  for (const row of rows) {
    let fileUrl: string
    if (publicBase && row.r2_key) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (row.r2_key && typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.yumekai_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }

    const displayName = row.nickname || `Anon${row.id?.slice(-4)}`
    items.push({
      id: row.id,
      title: row.title,
      tags: row.tags || null,
      type: row.type as 'image' | 'music' | 'prompt',
      url: fileUrl,
      download_points: Number(row.download_points ?? 2),
      created_at: new Date(row.created_at).toISOString(),
      view_count: Number(row.view_count ?? 0),
      play_count: Number(row.play_count ?? 0),
      user: {
        name: displayName,
        email: row.email,
      },
      pinned: row.id === pinnedRow?.pinned_post_id,
    })
  }

  return jsonResponse({ items })
}
