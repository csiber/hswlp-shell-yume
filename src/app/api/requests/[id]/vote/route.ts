import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { init } from '@paralleldrive/cuid2'
import { ROLES_ENUM } from '@/db/schema'

interface RouteContext<T>{params: Promise<T>}

const createId = init({ length: 32 })

export async function POST(req: Request, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success:false }, { status:401 })
  const { submissionId, score } = (await req.json().catch(() => ({}))) as { submissionId?: string; score?: number }
  if (!submissionId) {
    return jsonResponse({ success:false, error:'submissionId kötelező' }, { status:400 })
  }
  const { id } = await params
  const { env } = getCloudflareContext()
  const requestRow = await env.DB.prepare('SELECT user_id, request_category, status, deadline, voting_mode FROM requests WHERE id = ?1')
    .bind(id).first<{ user_id: string; request_category: string; status: string; deadline: string | null; voting_mode: string }>()
  if (!requestRow || requestRow.request_category !== 'challenge') {
    return jsonResponse({ success:false, error:'Csak kihívásokra lehet szavazni.' }, { status:400 })
  }
  if (requestRow.status === 'fulfilled') {
    return jsonResponse({ success:false, error:'A kihívás már lezárult.' }, { status:400 })
  }
  const isOwner = requestRow.user_id === session.user.id
  const isAdmin = session.user.role === ROLES_ENUM.ADMIN
  if (requestRow.voting_mode === 'jury' && !isOwner && !isAdmin) {
    return jsonResponse({ success:false, error:'Csak a zsűri szavazhat ezen a kihíváson.' }, { status:403 })
  }

  const submissionRow = await env.DB.prepare('SELECT id FROM request_submissions WHERE id = ?1 AND request_id = ?2')
    .bind(submissionId, id)
    .first<{ id: string }>()
  if (!submissionRow) {
    return jsonResponse({ success:false, error:'A nevezés nem található.' }, { status:404 })
  }

  const normalizedScore = Math.max(1, Math.min(10, Math.round(typeof score === 'number' ? score : 1)))
  const existing = await env.DB.prepare('SELECT id FROM request_votes WHERE request_id = ?1 AND voter_user_id = ?2')
    .bind(id, session.user.id)
    .first<{ id: string }>()

  if (existing) {
    await env.DB.prepare('UPDATE request_votes SET submission_id = ?1, score = ?2, created_at = ?3 WHERE id = ?4')
      .bind(submissionId, normalizedScore, new Date().toISOString(), existing.id)
      .run()
  } else {
    await env.DB.prepare('INSERT INTO request_votes (id, request_id, submission_id, voter_user_id, score) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(`rv_${createId()}`, id, submissionId, session.user.id, normalizedScore)
      .run()
  }

  if (requestRow.voting_mode === 'community' && requestRow.status === 'open' && requestRow.deadline) {
    const deadline = new Date(requestRow.deadline)
    if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) {
      await env.DB.prepare('UPDATE requests SET status = ?1 WHERE id = ?2').bind('voting', id).run()
    }
  }

  const submissionsRows = await env.DB.prepare(
    `SELECT rs.id, rs.file_url, u.nickname,
            COALESCE((SELECT SUM(score) FROM request_votes WHERE submission_id = rs.id), 0) as score
     FROM request_submissions rs
     JOIN user u ON u.id = rs.user_id
     WHERE rs.request_id = ?1`
  )
    .bind(id)
    .all<Record<string, string | number>>()

  const submissions = (submissionsRows.results || []).map((row) => ({
    id: String(row.id),
    file_url: String(row.file_url),
    nickname: String(row.nickname ?? 'ismeretlen'),
    score: Number(row.score ?? 0),
  })).sort((a, b) => {
    if (b.score === a.score) return a.nickname.localeCompare(b.nickname)
    return b.score - a.score
  })

  return jsonResponse({ success:true, submissions })
}
