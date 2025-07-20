import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { init } from '@paralleldrive/cuid2'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> {
  params: Promise<T>
}

const createId = init({ length: 32 })

interface CommentRow {
  id: string
  content: string
  created_at: string
  nickname: string | null
  email: string
  avatar: string | null
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: uploadId } = await params
  const { env } = getCloudflareContext()
  const dbComments = getDb(env, 'comments')
  const dbReactions = getDb(env, 'comment_reactions')
  const dbUsers = env.DB_GLOBAL
  const session = await getSessionFromCookie()
  const rows = await dbComments.prepare(
    `SELECT c.id, c.user_id, c.content, c.created_at
     FROM comments c
     WHERE c.upload_id = ?1
     ORDER BY c.created_at ASC`
  ).bind(uploadId).all<CommentRow>()

  const userIds = Array.from(new Set((rows.results || []).map(r => r.user_id)))
  const userMap: Record<string, { nickname: string | null; email: string; avatar: string | null }> = {}
  for (const id of userIds) {
    const u = await dbUsers
      .prepare('SELECT nickname, email, avatar FROM user WHERE id = ?1')
      .bind(id)
      .first<{ nickname: string | null; email: string; avatar: string | null }>()
    if (u) userMap[id] = { nickname: u.nickname, email: u.email, avatar: u.avatar }
  }
  const comments = [] as {
    id: string
    text: string
    created_at: string
    user: { name: string; avatar?: string }
    reactions: { emoji: string; count: number; reacted: boolean }[]
  }[]

  for (const row of rows.results || []) {
    const reactionRows = await dbReactions.prepare(
      'SELECT emoji, COUNT(*) as count FROM comment_reactions WHERE comment_id = ?1 GROUP BY emoji'
    ).bind(row.id).all<{ emoji: string; count: number }>()
    let userRows: { emoji: string }[] = []
    if (session?.user?.id) {
      const r = await dbReactions.prepare(
        'SELECT emoji FROM comment_reactions WHERE comment_id = ?1 AND user_id = ?2'
      ).bind(row.id, session.user.id).all<{ emoji: string }>()
      userRows = r.results || []
    }
    const reactions = (reactionRows.results || []).map(r => ({
      emoji: r.emoji,
      count: r.count,
      reacted: userRows.some(u => u.emoji === r.emoji)
    }))
    const u = userMap[row.user_id] || { nickname: null, email: '', avatar: null }
    comments.push({
      id: row.id,
      text: row.content,
      created_at: new Date(row.created_at).toISOString(),
      user: {
        name: u.nickname || u.email,
        avatar: u.avatar ?? undefined,
      },
      reactions
    })
  }
  return jsonResponse({ comments })
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: uploadId } = await params
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { text } = (await req.json()) as { text: string }
  if (typeof text !== 'string' || !text.trim() || text.length > 500) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const dbComments = getDb(env, 'comments')
  const id = `com_${createId()}`
  await dbComments.prepare(
    'INSERT INTO comments (id, upload_id, user_id, content) VALUES (?1, ?2, ?3, ?4)'
  ).bind(id, uploadId, session.user.id, text.trim()).run()

  return jsonResponse({
    success: true,
    comment: {
      id,
      text: text.trim(),
      created_at: new Date().toISOString(),
      user: {
        name: session.user.nickname || session.user.email,
        avatar: session.user.avatar ?? undefined,
      },
    },
  })
}

