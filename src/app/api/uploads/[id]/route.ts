import { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { consumeCredits } from '@/utils/credits'
import { jsonResponse } from '@/utils/api'
import { withRateLimit } from '@/utils/with-rate-limit'
import { getDb } from '@/lib/getDb'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

interface RouteContext<T> { params: Promise<T> }


export async function PUT(req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const dbEdits = getDb(env, 'upload_edits')
  const body = await req.json() as { title?: string; description?: string; tags?: string; note?: string }

  return withRateLimit(async () => {
    const { id } = await params


    const row = await db.prepare('SELECT user_id, title, description, tags, note, created_at, moderation_status, locked FROM uploads WHERE id = ?1')
      .bind(id)
      .first<{ user_id: string; title: string | null; description: string | null; tags: string | null; note: string | null; created_at: string; moderation_status: string | null; locked: number | null }>()

    if (!row || row.user_id !== session.user.id) {
      return jsonResponse({ success: false, error: 'Not found' }, { status: 404 })
    }
    if (row.locked) {
      return jsonResponse({ success: false, error: 'This file is locked and cannot be edited.' }, { status: 403 })
    }

    const createdAt = new Date(row.created_at)
    const editableWindow = 1000 * 60 * 60
    const isFreeEdit = Date.now() - createdAt.getTime() < editableWindow

    let cost = 0
    const changedTitle = body.title !== undefined && body.title !== row.title
    const changedDescription = body.description !== undefined && body.description !== row.description
    const changedTags = body.tags !== undefined && body.tags !== row.tags

    if (!isFreeEdit) {
      if (changedTitle) cost += 1
      if (changedDescription) cost += 2
      if (changedTags) cost += 1
    }

    const updates: { field: string; oldValue: string | null; newValue: string | null }[] = []
    if (changedTitle) {
      updates.push({ field: 'title', oldValue: row.title, newValue: body.title! })
    }
    if (changedDescription) {
      updates.push({ field: 'description', oldValue: row.description, newValue: body.description! })
    }
    if (changedTags) {
      updates.push({ field: 'tags', oldValue: row.tags, newValue: body.tags! })
    }
    const changedNote = body.note !== undefined && body.note !== row.note
    if (changedNote) {
      updates.push({ field: 'note', oldValue: row.note, newValue: body.note! })
    }


    if (cost > 0) {
      try {
        await consumeCredits({ userId: session.user.id, amount: cost, description: 'Upload edit' })
      } catch {
        return jsonResponse({ success: false, error: 'Insufficient credits' }, { status: 402 })
      }
    }

    const hasChanges = changedTitle || changedDescription || changedTags || changedNote
    if (hasChanges) {
      await dbEdits.prepare(
        'INSERT INTO upload_versions (id, upload_id, user_id, title, description, tags, note) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
      ).bind(
        uuidv4(),
        id,
        session.user.id,
        row.title,
        row.description,
        row.tags,
        row.note
      ).run()
    }

    const newModeration = (changedDescription || changedTags) ? 'pending' : row.moderation_status
    await db.prepare(
      'UPDATE uploads SET title = COALESCE(?2,title), description = ?3, tags = ?4, note = ?5, moderation_status = ?6 WHERE id = ?1'
    ).bind(id, body.title, body.description, body.tags, body.note, newModeration).run()

    const latest = await db.prepare('SELECT title, description, tags FROM uploads WHERE id = ?1')
      .bind(id)
      .first<{ title: string | null; description: string | null; tags: string | null }>()

    const input = `${latest?.title ?? ''}|${latest?.description ?? ''}|${latest?.tags ?? ''}`
    const hash = createHash('sha256').update(input).digest('hex')

    for (const update of updates) {
      await dbEdits.prepare(
        'INSERT INTO upload_edits (upload_id, user_id, field, old_value, new_value, hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
      ).bind(id, session.user.id, update.field, update.oldValue, update.newValue, hash).run()
    }

    const meta = await dbEdits.prepare(
      'SELECT MAX(created_at) as last_edit_at, COUNT(*) as edit_count FROM upload_edits WHERE upload_id = ?1'
    ).bind(id).first<{ last_edit_at: string | null; edit_count: number | null }>()

    return jsonResponse({ success: true, cost, last_edit_at: meta?.last_edit_at ?? null, edit_count: meta?.edit_count ?? 0 })
  }, { identifier: 'upload-edit', limit: 10, windowInSeconds: 60, userIdentifier: session.user.id })
}
