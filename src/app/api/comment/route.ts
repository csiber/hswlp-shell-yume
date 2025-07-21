import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest } from 'next/server'
import { getDb } from '@/lib/getDb'

interface CommentRow {
  id: string
  user_id: string
  content: string
  created_at: string
}

export async function GET(req: NextRequest) {
  const uploadId = req.nextUrl.searchParams.get('upload_id')
  if (!uploadId) {
    return jsonResponse({ comments: [] }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const db = getDb(env, 'comments')
  // uses DB_GLOBAL
  const dbUsers = env.DB_GLOBAL
  const rows = await db.prepare(
    `SELECT c.id, c.user_id, c.content, c.created_at
     FROM comments c
     WHERE c.upload_id = ?1
     ORDER BY c.created_at ASC`
  ).bind(uploadId).all<CommentRow>()

  const userIds = Array.from(new Set((rows.results || []).map(r => r.user_id)))
  const userMap: Record<string, { firstName: string | null; lastName: string | null; email: string }> = {}
  for (const id of userIds) {
    const u = await dbUsers
      .prepare('SELECT firstName, lastName, email FROM user WHERE id = ?1')
      .bind(id)
      .first<{ firstName: string | null; lastName: string | null; email: string }>()
    if (u) userMap[id] = { firstName: u.firstName, lastName: u.lastName, email: u.email }
  }

  const comments = (rows.results || []).map(row => {
    const u = userMap[row.user_id] || { firstName: null, lastName: null, email: '' }
    return {
      id: row.id,
      content: row.content,
      created_at: new Date(row.created_at).toISOString(),
      user: {
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
      }
    }
  })

  return jsonResponse({ comments })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { upload_id, content } = (await req.json()) as { upload_id?: string; content?: string }
  if (!upload_id || typeof content !== 'string' || content.trim().length < 2) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const db = getDb(env, 'comments')
  const id = `com_${uuidv4()}`
  const text = content.trim()
  await db.prepare(
    'INSERT INTO comments (id, upload_id, user_id, content) VALUES (?1, ?2, ?3, ?4)'
  ).bind(id, upload_id, session.user.id, text).run()

  const comment = {
    id,
    content: text,
    created_at: new Date().toISOString(),
    user: {
      name: [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') || session.user.email
    }
  }

  return jsonResponse({ success: true, comment }, { status: 201 })
}
