import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ items: [] }, { status: 401 })
  }

  const { env } = getCloudflareContext()

  const dbUser = env.DB_GLOBAL
  const dbUploads = getDb(env, 'uploads')

  const pinnedRow = await dbUser.prepare(
    'SELECT pinned_post_id FROM user WHERE id = ?1 LIMIT 1'
  ).bind(session.user.id).first<{ pinned_post_id: string | null }>()

  let pinnedItem: Record<string, string> | null = null
  if (pinnedRow?.pinned_post_id) {
    const row = await dbUploads.prepare(
      `SELECT u.id, u.title, u.tags, u.type, u.created_at, u.url, u.r2_key,
              u.view_count, u.play_count, u.download_points, u.user_id
         FROM uploads u
        WHERE u.id = ?1 AND u.approved = 1 AND u.visibility = 'public'
        LIMIT 1`
    ).bind(pinnedRow.pinned_post_id).first<Record<string, string>>()
    if (row) {
      const user = await dbUser.prepare(
        'SELECT nickname, email FROM user WHERE id = ?1'
      ).bind(row.user_id).first<{ nickname: string | null; email: string }>()
      if (user) {
        pinnedItem = { ...row, nickname: user.nickname ?? '', email: user.email } as Record<string, string>
      }
    }
  }

  const result = await dbUploads.prepare(
    `SELECT u.id, u.title, u.tags, u.type, u.created_at, u.url, u.r2_key,
            u.view_count, u.play_count, u.download_points, u.user_id
       FROM uploads u
      WHERE u.approved = 1 AND u.visibility = 'public'
      ORDER BY u.created_at DESC
      LIMIT 50`
  ).all<Record<string, string>>()

  const userIds = Array.from(new Set((result.results || []).map(r => r.user_id)))
  const userMap: Record<string, { nickname: string | null; email: string }> = {}
  for (const uid of userIds) {
    const u = await dbUser
      .prepare('SELECT nickname, email FROM user WHERE id = ?1')
      .bind(uid)
      .first<{ nickname: string | null; email: string }>()
    if (u) userMap[uid] = { nickname: u.nickname ?? null, email: u.email }
  }

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
    else if (row.r2_key && typeof (env.hswlp_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }

    const u = userMap[row.user_id] || { nickname: null, email: '' }
    const displayName = u.nickname || `Anon${row.id?.slice(-4)}`
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
        email: u.email,
      },
      pinned: row.id === pinnedRow?.pinned_post_id,
    })
  }

  return jsonResponse({ items })
}
