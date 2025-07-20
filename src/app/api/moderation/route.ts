import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/lib/getDb'

export async function GET() {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const result = await db.prepare(
    "SELECT id, title, tags, type, mime, url FROM uploads WHERE moderation_status = 'pending' ORDER BY created_at DESC"
  ).all<{ id: string; title: string; tags: string | null; type: string; mime: string | null; url: string }>()
  return jsonResponse({ items: result.results || [] })
}
