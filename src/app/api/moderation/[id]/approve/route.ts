import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'

interface RouteContext<T> { params: Promise<T> }

export async function POST(_req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const { id } = await params
  await env.DB.prepare('UPDATE uploads SET approved = 1 WHERE id = ?1').bind(id).run()
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
