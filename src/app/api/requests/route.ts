import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { init } from '@paralleldrive/cuid2'
import { enrichRequestRow, type EnrichedRequest, type RawRequestRow, type DatabaseContext } from './_helpers/enrich-request'

const createId = init({ length: 32 })
const banned = /(loli|shota|hentai|rape|guro|nude|sexual|porn|fuck|pussy|underage|bdsm|nsfw|abuse|boob|tits|cum)/i

export async function GET() {
  const session = await getSessionFromCookie()
  const { env } = getCloudflareContext()
  const databaseEnv: DatabaseContext = { DB: env.DB }
  try {
    const rows = await env.DB.prepare(
      `SELECT r.id, r.prompt, r.type, r.style, r.offered_credits, r.extra_reward_credits, r.status, r.created_at, r.request_category, r.voting_mode,
              r.deadline, r.accepted_user_id, u.nickname
       FROM requests r JOIN user u ON r.user_id = u.id
      WHERE r.status != 'fulfilled'
      ORDER BY r.created_at DESC`
    ).all<RawRequestRow>()

    const voteMap = new Map<string, string | null>()
    if (session?.user?.id) {
      const voteRows = await env.DB.prepare(
        'SELECT request_id, submission_id FROM request_votes WHERE voter_user_id = ?1'
      )
        .bind(session.user.id)
        .all<Record<string, string | null>>()
      for (const entry of voteRows.results || []) {
        voteMap.set(String(entry.request_id), entry.submission_id ?? null)
      }
    }

    const items: EnrichedRequest[] = []
    for (const raw of rows.results || []) {
      const mapped = await enrichRequestRow({
        env: databaseEnv,
        row: raw,
        currentVote: voteMap.get(String(raw.id)) ?? null,
      })
      items.push(mapped)
    }
    return jsonResponse({ items })
  } catch (err) {
    console.error('Failed to fetch requests', err)
    return jsonResponse({ items: [] })
  }
}

export async function POST(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as
    | {
        prompt?: string
        type?: string
        style?: string
        offered_credits?: number
        request_category?: string
        deadline?: string
        extra_reward_credits?: number
        voting_mode?: string
      }
    | null
  if (!body) return jsonResponse({ error: 'Invalid JSON' }, { status: 400 })
  const {
    prompt,
    type,
    style,
    offered_credits,
    request_category = 'standard',
    deadline,
    extra_reward_credits = 0,
    voting_mode = 'jury',
  } = body
  if (!prompt || !type || !style || typeof offered_credits !== 'number') {
    return jsonResponse({ error: 'Missing fields' }, { status: 400 })
  }
  const normalizedOfferedCredits = Math.floor(offered_credits)
  if (!Number.isFinite(normalizedOfferedCredits) || normalizedOfferedCredits <= 0) {
    return jsonResponse({ error: 'Érvénytelen kredit összeg.' }, { status: 400 })
  }
  if (banned.test(prompt) || banned.test(style)) {
    const { env } = getCloudflareContext()
    await env.DB.prepare(
      'INSERT INTO request_flagged_attempts (id, user_id, prompt) VALUES (?1, ?2, ?3)'
    ).bind(`rfa_${createId()}`, session.user.id, prompt).run()
    return jsonResponse({ error: 'This content is not allowed. Please rephrase it.' }, { status: 400 })
  }
  const normalizedCategory = request_category === 'challenge' ? 'challenge' : 'standard'
  const normalizedVoting = voting_mode === 'community' ? 'community' : 'jury'
  const bonus = typeof extra_reward_credits === 'number' && extra_reward_credits > 0 ? Math.floor(extra_reward_credits) : 0
  const totalPotentialCost = normalizedOfferedCredits + bonus
  let deadlineValue: Date | null = null
  if (normalizedCategory === 'challenge') {
    if (!deadline) {
      return jsonResponse({ error: 'A kihívásokhoz kötelező határidőt megadni.' }, { status: 400 })
    }
    const parsed = new Date(deadline)
    if (Number.isNaN(parsed.getTime())) {
      return jsonResponse({ error: 'Érvénytelen határidő' }, { status: 400 })
    }
    deadlineValue = parsed
  }
  const { env } = getCloudflareContext()
  try {
    const creditRow = await env.DB.prepare('SELECT currentCredits as c FROM user WHERE id = ?1')
      .bind(session.user.id)
      .first<{ c: number }>()
    if (!creditRow || creditRow.c < totalPotentialCost) {
      return jsonResponse({ error: 'Nincs elegendő kredited a jutalomra.' }, { status: 400 })
    }
    const id = `req_${createId()}`
    await env.DB.prepare(
      'INSERT INTO requests (id, user_id, prompt, type, style, offered_credits, request_category, voting_mode, deadline, extra_reward_credits, status, is_flagged) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 0)'
    )
      .bind(
        id,
        session.user.id,
        prompt,
        type,
        style,
        normalizedOfferedCredits,
        normalizedCategory,
        normalizedVoting,
        deadlineValue ? deadlineValue.toISOString() : null,
        bonus,
        'open',
      )
      .run()
    return jsonResponse({ id })
  } catch (err) {
    console.error('Failed to submit request', err)
    return jsonResponse({ error: 'Database error' }, { status: 500 })
  }
}
