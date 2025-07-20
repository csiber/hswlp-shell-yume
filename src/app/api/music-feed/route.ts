import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const result = await db.prepare(`
    SELECT u.id, u.title, u.type, u.created_at,
           u.view_count, u.play_count,
           usr.firstName, usr.lastName, usr.email
    FROM uploads u
    JOIN user usr ON u.user_id = usr.id
    WHERE u.type = 'music'
    ORDER BY u.created_at DESC
    LIMIT 50
  `).all<Record<string, string>>()

  const items = result.results.map(row => ({
    id: row.id,
    title: row.title,
    type: 'music',
    url: `/api/files/${row.id}`,
    created_at: new Date(row.created_at).toISOString(),
    view_count: Number(row.view_count ?? 0),
    play_count: Number(row.play_count ?? 0),
    user: {
      name: [row.firstName, row.lastName].filter(Boolean).join(' ') || null,
      email: row.email,
    },
  }))

  return jsonResponse({ items })
}
