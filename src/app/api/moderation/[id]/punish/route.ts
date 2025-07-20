import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { consumeCredits } from '@/utils/credits'
import { PUNISHMENT_CREDIT_LOSS, UPLOAD_BAN_HOURS } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> { params: Promise<T> }

export async function POST(req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const dbUploads = getDb(env, 'uploads')
  const dbUserPunishments = getDb(env, 'user_punishments')
  const dbUsers = env.DB_GLOBAL
  const { id } = await params
  const { reason } = await req.json() as { reason: string }

  const upload = await dbUploads.prepare('SELECT user_id FROM uploads WHERE id = ?1 LIMIT 1').bind(id).first<{ user_id: string }>()
  if (!upload) return new Response('Not found', { status: 404 })

  await dbUploads.prepare('UPDATE uploads SET approved = 1, moderation_status = ?1, moderation_reason = ?2 WHERE id = ?3')
    .bind('punished', reason, id).run()

  const until = new Date(Date.now() + UPLOAD_BAN_HOURS * 3600 * 1000).toISOString()
  await dbUserPunishments.prepare('INSERT INTO user_punishments (id, user_id, reason, until) VALUES (?1, ?2, ?3, ?4)')
    .bind(uuidv4(), upload.user_id, reason, until).run()

  await dbUsers.prepare('UPDATE user SET upload_ban_until = ?1, uploadBanReason = ?2 WHERE id = ?3')
    .bind(until, reason, upload.user_id).run()

  try {
    await consumeCredits({ userId: upload.user_id, amount: PUNISHMENT_CREDIT_LOSS, description: 'Moderation punishment' })
  } catch {}

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
