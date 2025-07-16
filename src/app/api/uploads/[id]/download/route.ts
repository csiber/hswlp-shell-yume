import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { consumeCredits } from '@/utils/credits'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

interface RouteContext<T> { params: Promise<T> }

export async function GET(req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { env } = getCloudflareContext()
  const { id } = await params
  const row = await env.DB.prepare(
    'SELECT r2_key, download_points, user_id, type FROM uploads WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{ r2_key: string; download_points: number | null; user_id: string; type: string }>()

  if (!row) {
    return new Response('Not found', { status: 404 })
  }

  const points = row.download_points ?? 2
  try {
    await consumeCredits({ userId: session.user.id, amount: points, description: 'File download' })
  } catch {
    return jsonResponse({ success: false, error: 'Insufficient credits' }, { status: 402 })
  }

  await env.DB.prepare(
    'INSERT INTO downloads (user_id, upload_id) VALUES (?1, ?2)'
  ).bind(session.user.id, id).run()

  const object = await env.hswlp_r2.get(row.r2_key)
  if (!object?.body) {
    return new Response('File not found', { status: 404 })
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': object.httpMetadata?.contentType || row.type.startsWith('audio/') ? 'audio/mpeg' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${id}"`,
      'Cache-Control': 'no-store'
    }
  })
}
