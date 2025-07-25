import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { consumeCredits, addCredits } from '@/utils/credits'
interface RouteContext<T>{params: Promise<T>}

export async function POST(_req: Request, { params }: RouteContext<{ id:string; submission_id:string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const { id, submission_id } = await params
  const { env } = getCloudflareContext()
  const reqRow = await env.DB.prepare('SELECT user_id, offered_credits, status FROM requests WHERE id = ?1')
    .bind(id).first<{ user_id:string; offered_credits:number; status:string }>()
  if (!reqRow || reqRow.user_id !== session.user.id) return jsonResponse({ success:false }, { status:403 })
  if (reqRow.status !== 'open') return jsonResponse({ success:false, error:'Already closed' }, { status:400 })
  const subRow = await env.DB.prepare('SELECT user_id, is_approved FROM request_submissions WHERE id = ?1 AND request_id = ?2')
    .bind(submission_id, id).first<{ user_id:string; is_approved:number }>()
  if (!subRow) return jsonResponse({ success:false, error:'Submission not found' }, { status:404 })
  await env.DB.prepare('UPDATE request_submissions SET is_approved = 1 WHERE id = ?1').bind(submission_id).run()
  await env.DB.prepare('UPDATE requests SET status = ?1 WHERE id = ?2').bind('fulfilled', id).run()
  try {
    await consumeCredits({ userId: session.user.id, amount: reqRow.offered_credits, description: 'Request payment' })
    await addCredits({ userId: subRow.user_id, amount: reqRow.offered_credits, description: 'Request reward' })
  } catch {}
  return jsonResponse({ success:true })
}
