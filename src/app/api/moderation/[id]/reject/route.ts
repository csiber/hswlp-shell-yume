import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'

interface RouteContext<T> { params: Promise<T> }

export async function POST(_req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const { id } = await params
  const row = await env.DB.prepare('SELECT r2_key FROM uploads WHERE id = ?1 LIMIT 1').bind(id).first<{ r2_key: string | null }>()
  if (row?.r2_key) {
    await env.hswlp_r2.delete(row.r2_key)
  }
  await env.DB.prepare('DELETE FROM uploads WHERE id = ?1').bind(id).run()
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
