import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ items: [] }, { status: 401 })
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    'SELECT id, prompt, style, offered_credits, status FROM requests WHERE user_id = ?1 ORDER BY created_at DESC'
  ).bind(session.user.id).all<Record<string, string>>()
  const items = (rows.results || []).map(r => ({
    id: r.id,
    prompt: r.prompt,
    style: r.style,
    offered_credits: Number(r.offered_credits),
    status: r.status,
  }))
  return jsonResponse({ items })
}
