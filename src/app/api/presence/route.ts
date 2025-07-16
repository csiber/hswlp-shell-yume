import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest } from 'next/server'

export async function GET() {
  const { env } = getCloudflareContext()
  const list = await env.PRESENCE_KV.list({ prefix: 'session:' })
  return Response.json({ online: list.keys.length })
}

export async function PUT(req: NextRequest) {
  const { env } = getCloudflareContext()
  const { searchParams } = new URL(req.url)
  let sessionId = searchParams.get('session_id')
  const userId = searchParams.get('user_id') || 'guest'
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }
  await env.PRESENCE_KV.put(`session:${sessionId}`, userId, { expirationTtl: 60 })
  return Response.json({ ok: true, sessionId })
}
