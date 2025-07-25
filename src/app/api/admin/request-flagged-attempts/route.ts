import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    'SELECT id, user_id, prompt, created_at FROM request_flagged_attempts ORDER BY created_at DESC LIMIT 100'
  ).all<Record<string, string>>()
  const items = (rows.results || []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    prompt: r.prompt,
    created_at: r.created_at,
  }))
  return jsonResponse({ items })
}
