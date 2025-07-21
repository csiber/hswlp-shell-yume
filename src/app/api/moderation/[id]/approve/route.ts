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
  // uses DB_GLOBAL
  const userDb = getDb(env, 'DB_GLOBAL')
  console.log('approve /user binding', userDb === env.DB_GLOBAL ? 'DB_GLOBAL' : 'DB')
  const sourceApp = deriveSourceApp(req.headers.get('host') ?? undefined)
  const { id } = await params
  try {
    const upload = await db
      .prepare('SELECT user_id, credit_value, moderation_status FROM uploads WHERE id = ?1')
      .bind(id)
      .first<{ user_id: string; credit_value: number | null; moderation_status: string | null }>()

    if (!upload) {
      return new Response('Not found', { status: 404 })
    }

    if (upload.moderation_status === 'pending') {
      if ((upload.credit_value ?? 0) > 0) {
        try {
          // uses DB_GLOBAL
          const dbGlobal = getDb(env, 'DB_GLOBAL')
          const existing = await dbGlobal
            .prepare(
              'SELECT id FROM credit_transaction WHERE paymentIntentId = ?1 LIMIT 1'
          )
          .bind(id)
          .first<{ id: string }>()

        if (!existing) {
          try {
            await updateUserCredits(upload.user_id, upload.credit_value ?? 0)
          } catch (err) {
            console.error('updateUserCredits failed', {
              error: err,
              itemId: id,
              userId: upload.user_id,
              source: sourceApp,
            })
          }
          try {
            await logTransaction({
              userId: upload.user_id,
              amount: upload.credit_value ?? 0,
              description: 'Upload reward (moderation)',
              type: CREDIT_TRANSACTION_TYPE.UPLOAD_REWARD,
              paymentIntentId: id,
              sourceApp,
              source: 'yumekai',
            })
          } catch (err) {
            console.error('logTransaction failed', {
              error: err,
              itemId: id,
              userId: upload.user_id,
              source: sourceApp,
            })
          }
        }
      } catch (err) {
        console.error('Credit reward flow failed', {
          error: err,
          itemId: id,
          userId: upload.user_id,
          source: sourceApp,
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
  } catch (err) {
    console.error('Approve handler failed', { error: err, itemId: id, source: sourceApp })
    return new Response('Server error', { status: 500 })
  }
}
