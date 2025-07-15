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

  const items = [] as {
    id: string
    title: string
    type: 'music'
    url: string
    created_at: string
    user: { name: string | null; email: string }
  }[]

  for (const row of result.results || []) {
    const nameParts = [row.firstName, row.lastName].filter(Boolean)
    items.push({
      id: row.id,
      title: row.title,
      type: 'music',
      url: `/api/files/${row.id}`, // privát API endpoint
      created_at: new Date(row.created_at).toISOString(),
      user: {
        name: nameParts.length ? nameParts.join(' ') : null,
        email: row.email,
      },
    })
  }

  return jsonResponse({ items })
}
