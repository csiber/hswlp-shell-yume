import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDb } from '@/lib/getDb'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { deriveSourceApp } from '@/utils/source-app'
import { CREDIT_TRANSACTION_TYPE } from '@/db/schema'

interface RouteContext<T> { params: Promise<T> }

export async function POST(req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const sourceApp = deriveSourceApp(req.headers.get('host') ?? undefined)
  const { id } = await params

  const upload = await db
    .prepare('SELECT user_id, credit_value, moderation_status FROM uploads WHERE id = ?1')
    .bind(id)
    .first<{ user_id: string; credit_value: number | null; moderation_status: string | null }>()

  if (!upload) {
    return new Response('Not found', { status: 404 })
  }

  if (upload.moderation_status === 'pending') {
    if ((upload.credit_value ?? 0) > 0) {
      const dbGlobal = getDb(env, 'credit_transaction')
      const existing = await dbGlobal
        .prepare(
          'SELECT id FROM credit_transaction WHERE paymentIntentId = ?1 LIMIT 1'
        )
        .bind(id)
        .first<{ id: string }>()

      if (!existing) {
        await updateUserCredits(upload.user_id, upload.credit_value ?? 0)
        await logTransaction({
          userId: upload.user_id,
          amount: upload.credit_value ?? 0,
          description: 'Upload reward (moderation)',
          type: CREDIT_TRANSACTION_TYPE.UPLOAD_REWARD,
          paymentIntentId: id,
          sourceApp,
          source: 'yumekai',
        })
      }
    }
  }

  await db
    .prepare('UPDATE uploads SET approved = 1, moderation_status = ?1 WHERE id = ?2')
    .bind('approved', id)
    .run()

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
