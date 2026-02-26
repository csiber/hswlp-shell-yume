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
  const requestRow = await env.DB.prepare('SELECT status, accepted_user_id, request_category, deadline FROM requests WHERE id = ?1')
    .bind(id).first<{ status: string; accepted_user_id: string | null; request_category: string; deadline: string | null }>()
  if (!requestRow || requestRow.status === 'fulfilled') {
    return jsonResponse({ success:false, error:'Request closed' }, { status:400 })
  }
  if (requestRow.request_category === 'challenge' && requestRow.status === 'voting') {
    return jsonResponse({ success:false, error:'A szavazás megkezdődött, új nevezés nem adható le.' }, { status:400 })
  }
  if (requestRow.request_category === 'challenge') {
    if (requestRow.deadline) {
      const deadline = new Date(requestRow.deadline)
      if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) {
        return jsonResponse({ success:false, error:'A nevezési határidő lejárt.' }, { status:400 })
      }
    }
  } else if (requestRow.status === 'accepted' && requestRow.accepted_user_id !== session.user.id) {
    return jsonResponse({ success:false, error:'Not your request' }, { status:403 })
  }
  const insertResult = await env.DB.prepare(
    'INSERT OR IGNORE INTO request_submissions (id, request_id, user_id, file_url, is_approved) VALUES (?1, ?2, ?3, ?4, 0)'
  ).bind(`rsb_${createId()}`, id, session.user.id, file_url).run()
  if ((insertResult.meta?.changes ?? 0) === 0) {
    return jsonResponse({ success:true, duplicate:true })
  }
  return jsonResponse({ success:true, duplicate:false })
}
