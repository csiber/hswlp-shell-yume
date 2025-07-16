import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(
    'SELECT id, title, type, url FROM uploads WHERE approved = 0 ORDER BY created_at DESC'
  ).all<{ id: string; title: string; type: string; url: string }>()
  return jsonResponse({ items: result.results || [] })
}
