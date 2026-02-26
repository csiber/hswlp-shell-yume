import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
interface RouteContext<T>{params: Promise<T>}

export async function POST(_req: Request, { params }: RouteContext<{ id:string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const { id } = await params
  const { env } = getCloudflareContext()
  const row = await env.DB.prepare('SELECT status, request_category FROM requests WHERE id = ?1')
    .bind(id).first<{ status:string; request_category: string }>()
  if (!row) {
    return jsonResponse({ success:false, error:'Request not found' }, { status:404 })
  }
  if (row.request_category === 'challenge') {
    return jsonResponse({ success:false, error:'Ez egy kihívás, jelentkezés nélkül is beküldhetsz nevezést.' }, { status:400 })
  }
  if (row.status !== 'open') {
    return jsonResponse({ success:false, error:'Request not open' }, { status:400 })
  }
  const updateResult = await env.DB.prepare(
    'UPDATE requests SET accepted_user_id = ?1, status = ?2 WHERE id = ?3 AND status = ?4'
  ).bind(session.user.id, 'accepted', id, 'open').run()
  if ((updateResult.meta?.changes ?? 0) !== 1) {
    return jsonResponse({ success:false, error:'A kérés közben státuszt váltott.' }, { status:409 })
  }
  return jsonResponse({ success:true })
}
