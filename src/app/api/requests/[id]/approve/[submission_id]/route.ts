import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { ROLES_ENUM } from '@/db/schema'
import { finalizeRequest } from '../../../_helpers/finalize-request'
interface RouteContext<T>{params: Promise<T>}

export async function POST(_req: Request, { params }: RouteContext<{ id:string; submission_id:string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const { id, submission_id } = await params
  const { env } = getCloudflareContext()
  const databaseEnv = { DB: env.DB }
  const reqRow = await env.DB.prepare('SELECT user_id, offered_credits, extra_reward_credits, status FROM requests WHERE id = ?1')
    .bind(id).first<{ user_id:string; offered_credits:number; extra_reward_credits:number | null; status:string }>()
  if (!reqRow) return jsonResponse({ success:false }, { status:404 })
  const isOwner = reqRow.user_id === session.user.id
  const isAdmin = session.user.role === ROLES_ENUM.ADMIN
  if (!isOwner && !isAdmin) return jsonResponse({ success:false }, { status:403 })
  if (reqRow.status === 'fulfilled') return jsonResponse({ success:false, error:'Already closed' }, { status:400 })
  const subRow = await env.DB.prepare('SELECT user_id, is_approved FROM request_submissions WHERE id = ?1 AND request_id = ?2')
    .bind(submission_id, id).first<{ user_id:string; is_approved:number }>()
  if (!subRow) return jsonResponse({ success:false, error:'Submission not found' }, { status:404 })
  const finalizeResult = await finalizeRequest({
    env: databaseEnv,
    requestId: id,
    submissionId: submission_id,
    winnerUserId: subRow.user_id,
    requestOwnerId: reqRow.user_id,
    offeredCredits: reqRow.offered_credits,
    extraRewardCredits: reqRow.extra_reward_credits ?? 0,
    currentStatus: reqRow.status,
  })
  if (!finalizeResult.finalized) {
    return jsonResponse({ success:false, error:'A kérés státusza közben megváltozott.' }, { status:409 })
  }
  return jsonResponse({ success:true })
}
