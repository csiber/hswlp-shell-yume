import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> { params: Promise<T> }

export async function POST(_req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const { id } = await params
  await db.prepare('UPDATE uploads SET approved = 1, moderation_status = ?1 WHERE id = ?2')
    .bind('approved', id).run()
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
