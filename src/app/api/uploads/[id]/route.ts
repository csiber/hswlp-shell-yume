import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { consumeCredits } from '@/utils/credits'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

interface RouteContext<T> { params: T }

export async function PUT(req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  const body = await req.json() as { title?: string; description?: string; tags?: string; note?: string }
  const row = await env.DB.prepare('SELECT user_id, title, description, tags FROM uploads WHERE id = ?1')
    .bind(params.id)
    .first<{ user_id: string; title: string | null; description: string | null; tags: string | null }>()

  if (!row || row.user_id !== session.user.id) {
    return jsonResponse({ success: false, error: 'Not found' }, { status: 404 })
  }

  let cost = 0
  if (body.title !== undefined && body.title !== row.title) cost += 1
  if (body.description !== undefined && body.description !== row.description) cost += 2
  if (body.tags !== undefined && body.tags !== row.tags) cost += 1

  if (cost > 0) {
    try {
      await consumeCredits({ userId: session.user.id, amount: cost, description: 'Upload edit' })
    } catch {
      return jsonResponse({ success: false, error: 'Insufficient credits' }, { status: 402 })
    }
  }

  await env.DB.prepare(
    'UPDATE uploads SET title = COALESCE(?2,title), description = ?3, tags = ?4, note = ?5 WHERE id = ?1'
  ).bind(params.id, body.title, body.description, body.tags, body.note).run()

  return jsonResponse({ success: true, cost })
}
