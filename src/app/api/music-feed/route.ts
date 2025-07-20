import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const dbUsers = env.DB_GLOBAL
  const result = await db.prepare(
    `SELECT u.id, u.title, u.type, u.created_at,
            u.view_count, u.play_count, u.user_id
       FROM uploads u
      WHERE u.type = 'music'
      ORDER BY u.created_at DESC
      LIMIT 50`
  ).all<Record<string, string>>()

  const userIds = Array.from(new Set((result.results || []).map(r => r.user_id)))
  const userMap: Record<string, { firstName: string | null; lastName: string | null; email: string }> = {}
  for (const id of userIds) {
    const u = await dbUsers
      .prepare('SELECT firstName, lastName, email FROM user WHERE id = ?1')
      .bind(id)
      .first<{ firstName: string | null; lastName: string | null; email: string }>()
    if (u) userMap[id] = { firstName: u.firstName, lastName: u.lastName, email: u.email }
  }

  const items = (result.results || []).map(row => {
    const u = userMap[row.user_id] || { firstName: null, lastName: null, email: '' }
    return {
      id: row.id,
      title: row.title,
      type: 'music',
      url: `/api/files/${row.id}`,
      created_at: new Date(row.created_at).toISOString(),
      view_count: Number(row.view_count ?? 0),
      play_count: Number(row.play_count ?? 0),
      user: {
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        email: u.email,
      },
    }
  })

  return jsonResponse({ items })
}
