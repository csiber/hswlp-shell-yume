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
    `SELECT rs.id, rs.file_url, rs.is_approved, rs.user_id,
            u.nickname,
            COALESCE((SELECT SUM(score) FROM request_votes WHERE submission_id = rs.id), 0) as score
     FROM request_submissions rs
     JOIN user u ON u.id = rs.user_id
     WHERE rs.request_id = ?1`
  ).bind(id).all<Record<string, string | number>>()
  const items = (rows.results || []).map(r => ({
    id: String(r.id),
    file_url: String(r.file_url),
    is_approved: Number(r.is_approved) === 1,
    user_id: String(r.user_id),
    nickname: String(r.nickname ?? 'ismeretlen'),
    score: Number(r.score ?? 0),
  }))
  return jsonResponse({ items })
}
