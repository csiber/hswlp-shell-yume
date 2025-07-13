import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { WebhookService } from '@/app/services/WebhookService'
import { NextRequest } from 'next/server'
import { init } from '@paralleldrive/cuid2'

const createId = init({ length: 32 })

interface CommentRow {
  id: string
  text: string
  created_at: string
  firstName: string | null
  lastName: string | null
  email: string
  avatar: string | null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT c.id, c.text, c.created_at, u.firstName, u.lastName, u.email, u.avatar
     FROM comments c
     LEFT JOIN user u ON c.user_id = u.id
     WHERE c.post_id = ?1
     ORDER BY c.created_at ASC`
  ).bind(params.id).all<CommentRow>()
  const comments = (rows.results || []).map(row => ({
    id: row.id,
    text: row.text,
    created_at: new Date(row.created_at).toISOString(),
    user: {
      name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email,
      avatar: row.avatar ?? undefined,
    },
  }))
  return jsonResponse({ comments })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { text } = (await req.json()) as { text: string }
  if (typeof text !== 'string' || !text.trim() || text.length > 500) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const id = `com_${createId()}`
  await env.DB.prepare(
    'INSERT INTO comments (id, post_id, user_id, text) VALUES (?1, ?2, ?3, ?4)'
  ).bind(id, params.id, session.user.id, text.trim()).run()
  const upload = await env.DB.prepare(
    'SELECT user_id FROM uploads WHERE id = ?1 LIMIT 1'
  ).bind(params.id).first<{ user_id: string }>()
  if (upload?.user_id) {
    await WebhookService.dispatch(upload.user_id, 'comment', { by: session.user.id, comment_id: id })
  }
  return jsonResponse({
    success: true,
    comment: {
      id,
      text: text.trim(),
      created_at: new Date().toISOString(),
      user: {
        name: [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') || session.user.email,
        avatar: session.user.avatar ?? undefined,
      },
    },
  })
}

