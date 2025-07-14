import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest } from 'next/server'

interface Row {
  id: string
  content: string
  created_at: string
  firstName: string | null
  lastName: string | null
  email: string
}

export async function GET() {
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT m.id, m.content, m.created_at, u.firstName, u.lastName, u.email
     FROM chat_messages m
     LEFT JOIN user u ON m.user_id = u.id
     ORDER BY m.created_at DESC
     LIMIT 50`
  ).all<Row>()

  const messages = (rows.results || []).map(row => ({
    id: row.id,
    content: row.content,
    created_at: new Date(row.created_at).toISOString(),
    user: {
      name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email
    }
  }))

  return jsonResponse({ messages })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { content } = (await req.json()) as { content?: string }
  const text = (content || '').trim()
  if (text.length < 1) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const id = `chat_${uuidv4()}`
  await env.DB.prepare(
    'INSERT INTO chat_messages (id, user_id, content) VALUES (?1, ?2, ?3)'
  ).bind(id, session.user.id, text).run()
  const message = {
    id,
    content: text,
    created_at: new Date().toISOString(),
    user: {
      name: [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') || session.user.email
    }
  }
  return jsonResponse({ success: true, message }, { status: 201 })
}
