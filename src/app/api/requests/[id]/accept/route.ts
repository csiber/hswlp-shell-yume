import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
interface RouteContext<T>{params: Promise<T>}

export async function POST(_req: Request, { params }: RouteContext<{ id:string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const { id } = await params
  const { env } = getCloudflareContext()
  const row = await env.DB.prepare('SELECT status FROM requests WHERE id = ?1')
    .bind(id).first<{ status:string }>()
  if (!row || row.status !== 'open') {
    return jsonResponse({ success:false, error:'Request not open' }, { status:400 })
  }
  await env.DB.prepare('UPDATE requests SET accepted_user_id = ?1, status = ?2 WHERE id = ?3')
    .bind(session.user.id, 'accepted', id).run()
  return jsonResponse({ success:true })
}
