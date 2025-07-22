import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { consumeCredits } from '@/utils/credits'
import { updateAllSessionsOfUser } from '@/utils/kv-session'
import { getDb } from '@/utils/db'
import { z } from 'zod'

const bodySchema = z.object({
  nickname: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]{3,20}$/)
})

export async function PUT(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const parse = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parse.success) {
    return jsonResponse({ success: false, error: 'Invalid data' }, { status: 400 })
  }
  const { nickname } = parse.data

  const { env } = getCloudflareContext()
  const dbUser = getDb(env, 'DB_GLOBAL')
  const userRow = await dbUser.prepare(
    'SELECT nickname, nickname_updated_at, currentCredits FROM user WHERE id = ?1'
  ).bind(session.user.id).first<{ nickname: string | null; nickname_updated_at: string | null; currentCredits: number | null }>()

  if (!userRow) {
    return jsonResponse({ success: false, error: 'User not found' }, { status: 404 })
  }

  if (userRow.nickname === nickname) {
    return jsonResponse({ success: true })
  }

  const existing = await dbUser.prepare(
    'SELECT id FROM user WHERE nickname = ?1 AND id != ?2'
  ).bind(nickname, session.user.id).first<{ id: string }>()

  if (existing) {
    return jsonResponse({ success: false, error: 'Nickname already taken' }, { status: 409 })
  }

  const credits = userRow.currentCredits ?? 0
  if (credits < 50) {
    return jsonResponse({ success: false, error: 'Not enough credits to change nickname.' }, { status: 402 })
  }

  if (userRow.nickname_updated_at) {
    const last = new Date(userRow.nickname_updated_at)
    const diff = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 30) {
      return jsonResponse({ success: false, error: 'Nickname can only be changed every 30 days.' }, { status: 400 })
    }
  }

  try {
    await consumeCredits({ userId: session.user.id, amount: 50, description: 'Nickname change' })
  } catch {
    return jsonResponse({ success: false, error: 'Not enough credits to change nickname.' }, { status: 402 })
  }

  await dbUser.prepare(
    'UPDATE user SET nickname = ?1, nickname_updated_at = datetime(\'now\') WHERE id = ?2'
  ).bind(nickname, session.user.id).run()

  await updateAllSessionsOfUser(session.user.id)

  return jsonResponse({ success: true })
}
