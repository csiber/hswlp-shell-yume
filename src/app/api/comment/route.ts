import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest } from 'next/server'

interface CommentRow {
  id: string
  content: string
  created_at: string
  firstName: string | null
  lastName: string | null
  email: string
}

export async function GET(req: NextRequest) {
  const uploadId = req.nextUrl.searchParams.get('upload_id')
  if (!uploadId) {
    return jsonResponse({ comments: [] }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT c.id, c.content, c.created_at, u.firstName, u.lastName, u.email
     FROM comments c
     LEFT JOIN user u ON c.user_id = u.id
     WHERE c.upload_id = ?1
     ORDER BY c.created_at ASC`
  ).bind(uploadId).all<CommentRow>()

  const comments = (rows.results || []).map(row => ({
    id: row.id,
    content: row.content,
    created_at: new Date(row.created_at).toISOString(),
    user: {
      name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email
    }
  }))

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
  const id = `com_${uuidv4()}`
  const text = content.trim()
  await env.DB.prepare(
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
