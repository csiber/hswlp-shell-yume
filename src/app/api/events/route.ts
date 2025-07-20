import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const { env } = getCloudflareContext()
  const db = getDb(env, 'events')
  const result = await db.prepare(
    `SELECT id, title, slug, description, date, location, cover_url
     FROM events
     WHERE is_public = 1 AND date >= CURRENT_TIMESTAMP
     ORDER BY date ASC
     LIMIT 20`
  ).all<Record<string, string>>()

  const items = (result.results || []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    date: row.date,
    location: row.location,
    cover_url: row.cover_url || null,
  }))

  return jsonResponse({ items })
}
