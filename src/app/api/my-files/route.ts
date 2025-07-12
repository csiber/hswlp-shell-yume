// src/app/api/my-files/route.ts

import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  const { env } = getCloudflareContext()

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const allowedTypes = ['image', 'music', 'prompt']
  const filter = type && allowedTypes.includes(type) ? `AND type = '${type}'` : ''

  const result = await env.DB.prepare(`
    SELECT id, title, type, url
    FROM uploads
    WHERE user_id = ?1 ${filter}
    ORDER BY rowid DESC
  `).bind(session.user.id).all<{
    id: string, title: string, type: 'image' | 'music' | 'prompt', url: string
  }>()

  return Response.json({ success: true, items: result.results })
}
