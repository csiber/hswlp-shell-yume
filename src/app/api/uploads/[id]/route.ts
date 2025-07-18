import { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { consumeCredits } from '@/utils/credits'
import { jsonResponse } from '@/utils/api'
import { withRateLimit } from '@/utils/with-rate-limit'


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { env } = getCloudflareContext()
  const body = await req.json() as { title?: string; description?: string; tags?: string; note?: string }

  return withRateLimit(async () => {
    const { id } = params


    const row = await env.DB.prepare('SELECT user_id, title, description, tags, note FROM uploads WHERE id = ?1')
      .bind(id)
      .first<{ user_id: string; title: string | null; description: string | null; tags: string | null; note: string | null }>()

    if (!row || row.user_id !== session.user.id) {
      return jsonResponse({ success: false, error: 'Not found' }, { status: 404 })
    }

    let cost = 0
    if (body.title !== undefined && body.title !== row.title) cost += 1
    if (body.description !== undefined && body.description !== row.description) cost += 2
    if (body.tags !== undefined && body.tags !== row.tags) cost += 1

    const updates: { field: string; oldValue: string | null; newValue: string | null }[] = []
    if (body.title !== undefined && body.title !== row.title) {
      updates.push({ field: 'title', oldValue: row.title, newValue: body.title })
    }
    if (body.description !== undefined && body.description !== row.description) {
      updates.push({ field: 'description', oldValue: row.description, newValue: body.description })
    }
    if (body.tags !== undefined && body.tags !== row.tags) {
      updates.push({ field: 'tags', oldValue: row.tags, newValue: body.tags })
    }
    if (body.note !== undefined && body.note !== row.note) {
      updates.push({ field: 'note', oldValue: row.note, newValue: body.note })
    }

    if (cost > 0) {
      try {
        await consumeCredits({ userId: session.user.id, amount: cost, description: 'Upload edit' })
      } catch {
        return jsonResponse({ success: false, error: 'Insufficient credits' }, { status: 402 })
      }
    }

    await env.DB.prepare(
      'UPDATE uploads SET title = COALESCE(?2,title), description = ?3, tags = ?4, note = ?5 WHERE id = ?1'
    ).bind(id, body.title, body.description, body.tags, body.note).run()

    for (const update of updates) {
      await env.DB.prepare(
        'INSERT INTO upload_edits (upload_id, user_id, field, old_value, new_value) VALUES (?1, ?2, ?3, ?4, ?5)'
      ).bind(id, session.user.id, update.field, update.oldValue, update.newValue).run()
    }

    return jsonResponse({ success: true, cost })
  }, { identifier: 'upload-edit', limit: 10, windowInSeconds: 60, userIdentifier: session.user.id })
}
