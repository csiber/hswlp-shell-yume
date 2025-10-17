import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { enrichRequestRow, type EnrichedRequest, type RawRequestRow, type DatabaseContext } from '../requests/_helpers/enrich-request'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ items: [] }, { status: 401 })
  const { env } = getCloudflareContext()
  const databaseEnv: DatabaseContext = { DB: env.DB }
  const rows = await env.DB.prepare(
    `SELECT r.id, r.prompt, r.type, r.style, r.offered_credits, r.extra_reward_credits, r.status, r.created_at, r.request_category, r.voting_mode,
            r.deadline, r.accepted_user_id, u.nickname
     FROM requests r JOIN user u ON r.user_id = u.id
     WHERE r.user_id = ?1
     ORDER BY r.created_at DESC`
  ).bind(session.user.id).all<RawRequestRow>()

  const items: EnrichedRequest[] = []
  for (const row of rows.results || []) {
    const enriched = await enrichRequestRow({ env: databaseEnv, row, currentVote: null })
    items.push(enriched)
  }
  return jsonResponse({ items })
}
