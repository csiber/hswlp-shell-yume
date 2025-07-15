import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(`
    SELECT u.id, u.title, u.type, u.created_at,
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
    user: {
      name: [row.firstName, row.lastName].filter(Boolean).join(' ') || null,
      email: row.email,
    },
  }))

  return jsonResponse({ items })
}
