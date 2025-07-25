import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
interface RouteContext<T>{params: Promise<T>}

export async function GET(_req: Request, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ items: [] }, { status: 401 })
  const { id } = await params
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    'SELECT id, file_url, is_approved FROM request_submissions WHERE request_id = ?1'
  ).bind(id).all<Record<string, string>>()
  const items = (rows.results || []).map(r => ({
    id: r.id,
    file_url: r.file_url,
    is_approved: Number(r.is_approved) === 1,
  }))
  return jsonResponse({ items })
}
