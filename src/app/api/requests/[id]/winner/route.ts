import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { ROLES_ENUM } from '@/db/schema'
import { finalizeRequest } from '../../_helpers/finalize-request'

interface RouteContext<T>{params: Promise<T>}

export async function POST(req: Request, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const body = (await req.json().catch(() => ({}))) as { submissionId?: string; mode?: 'auto' | 'manual' }
  const { id } = await params
  const { env } = getCloudflareContext()
  const databaseEnv = { DB: env.DB }
  const requestRow = await env.DB.prepare('SELECT user_id, offered_credits, extra_reward_credits, status FROM requests WHERE id = ?1')
    .bind(id).first<{ user_id: string; offered_credits: number; extra_reward_credits: number | null; status: string }>()
  if (!requestRow) return jsonResponse({ success:false, error:'Request not found' }, { status:404 })
  const isOwner = requestRow.user_id === session.user.id
  const isAdmin = session.user.role === ROLES_ENUM.ADMIN
  if (!isOwner && !isAdmin) return jsonResponse({ success:false }, { status:403 })
  if (requestRow.status === 'fulfilled') {
    return jsonResponse({ success:false, error:'A kihívás már lezárult.' }, { status:400 })
  }

  let winnerSubmissionId = body.submissionId ?? null
  let winnerUserId: string | null = null

  if (body.mode === 'auto' || !winnerSubmissionId) {
    const topRow = await env.DB.prepare(
      `SELECT rs.id, rs.user_id,
              COALESCE(SUM(rv.score), 0) as score,
              rs.created_at
       FROM request_submissions rs
       LEFT JOIN request_votes rv ON rv.submission_id = rs.id
       WHERE rs.request_id = ?1
       GROUP BY rs.id
       ORDER BY score DESC, rs.created_at ASC
       LIMIT 1`
    )
      .bind(id)
      .first<{ id: string; user_id: string; score: number }>()

    if (!topRow) {
      return jsonResponse({ success:false, error:'Nincs egyetlen nevezés sem.' }, { status:400 })
    }
    if (!winnerSubmissionId) {
      if (!topRow.score || topRow.score <= 0) {
        return jsonResponse({ success:false, error:'Nincs elég szavazat az automatikus döntéshez.' }, { status:400 })
      }
      winnerSubmissionId = topRow.id
    }
    winnerUserId = topRow.user_id
  }

  if (!winnerSubmissionId) {
    return jsonResponse({ success:false, error:'submissionId szükséges' }, { status:400 })
  }

  if (!winnerUserId) {
    const submissionRow = await env.DB.prepare('SELECT user_id FROM request_submissions WHERE id = ?1 AND request_id = ?2')
      .bind(winnerSubmissionId, id)
      .first<{ user_id: string }>()
    if (!submissionRow) {
      return jsonResponse({ success:false, error:'A nevezés nem található.' }, { status:404 })
    }
    winnerUserId = submissionRow.user_id
  }

  const finalizeResult = await finalizeRequest({
    env: databaseEnv,
    requestId: id,
    submissionId: winnerSubmissionId,
    winnerUserId,
    requestOwnerId: requestRow.user_id,
    offeredCredits: requestRow.offered_credits,
    extraRewardCredits: requestRow.extra_reward_credits ?? 0,
    currentStatus: requestRow.status,
  })
  if (!finalizeResult.finalized) {
    return jsonResponse({ success:false, error:'A kérés státusza közben megváltozott.' }, { status:409 })
  }

  return jsonResponse({ success:true, winnerSubmissionId })
}
