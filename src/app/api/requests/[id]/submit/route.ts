import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { init } from '@paralleldrive/cuid2'
interface RouteContext<T>{params: Promise<T>}
const createId = init({ length:32 })

export async function POST(req: Request, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const { file_url } = (await req.json()) as { file_url?: string }
  if (!file_url) return jsonResponse({ success:false, error:'file_url required' }, { status:400 })
  const { id } = await params
  const { env } = getCloudflareContext()
  const requestRow = await env.DB.prepare('SELECT status FROM requests WHERE id = ?1')
    .bind(id).first<{ status: string }>()
  if (!requestRow || requestRow.status !== 'open') {
    return jsonResponse({ success:false, error:'Request closed' }, { status:400 })
  }
  await env.DB.prepare(
    'INSERT INTO request_submissions (id, request_id, user_id, file_url, is_approved) VALUES (?1, ?2, ?3, ?4, 0)'
  ).bind(`rsb_${createId()}`, id, session.user.id, file_url).run()
  return jsonResponse({ success:true })
}
