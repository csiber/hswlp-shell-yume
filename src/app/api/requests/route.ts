import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { init } from '@paralleldrive/cuid2'

const createId = init({ length: 32 })
const banned = /(loli|shota|hentai|rape|guro|nude|sexual|porn|fuck|pussy|underage|bdsm|nsfw|abuse|boob|tits|cum)/i

export async function GET() {
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT r.id, r.prompt, r.type, r.style, r.offered_credits, r.status, r.created_at, u.nickname
       FROM requests r JOIN user u ON r.user_id = u.id
      WHERE r.status = 'open'
      ORDER BY r.created_at DESC`
  ).all<Record<string, string>>()

  const items = (rows.results || []).map(r => ({
    id: r.id,
    prompt: r.prompt,
    type: r.type,
    style: r.style,
    offered_credits: Number(r.offered_credits),
    status: r.status,
    created_at: r.created_at,
    nickname: r.nickname,
  }))
  return jsonResponse({ items })
}

export async function POST(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }
  const { prompt, type, style, offered_credits } = (await req.json()) as {
    prompt?: string
    type?: string
    style?: string
    offered_credits?: number
  }
  if (!prompt || !type || !style || typeof offered_credits !== 'number') {
    return jsonResponse({ error: 'Missing fields' }, { status: 400 })
  }
  if (banned.test(prompt) || banned.test(style)) {
    const { env } = getCloudflareContext()
    await env.DB.prepare(
      'INSERT INTO request_flagged_attempts (id, user_id, prompt) VALUES (?1, ?2, ?3)'
    ).bind(`rfa_${createId()}`, session.user.id, prompt).run()
    return jsonResponse({ error: 'Ez a tartalom nem megengedett. Kérlek, fogalmazd újra.' }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const creditRow = await env.DB.prepare('SELECT current_credits as c FROM user WHERE id = ?1')
    .bind(session.user.id)
    .first<{ c: number }>()
  if (!creditRow || creditRow.c < offered_credits) {
    return jsonResponse({ error: 'Nincs elegendő kredited' }, { status: 400 })
  }
  const id = `req_${createId()}`
  await env.DB.prepare(
    'INSERT INTO requests (id, user_id, prompt, type, style, offered_credits, status, is_flagged) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)'
  ).bind(id, session.user.id, prompt, type, style, offered_credits, 'open').run()
  return jsonResponse({ id })
}
