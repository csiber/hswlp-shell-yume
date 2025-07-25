import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { BADGE_DEFINITIONS } from '@/constants'
import { init } from '@paralleldrive/cuid2'

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
  badge_key: string | null
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: uploadId } = await params
  const { env } = getCloudflareContext()
  const session = await getSessionFromCookie()
  const rows = await env.DB.prepare(
    `SELECT c.id, c.content, c.created_at, u.nickname, u.email, u.avatar,
            (SELECT badge_key FROM user_badges WHERE user_id = u.id ORDER BY awarded_at LIMIT 1) as badge_key
     FROM comments c
     LEFT JOIN user u ON c.user_id = u.id
     WHERE c.upload_id = ?1
     ORDER BY c.created_at ASC`
  ).bind(uploadId).all<CommentRow & { badge_key: string | null }>()
  const comments = [] as {
    id: string
    text: string
    created_at: string
    user: { name: string; avatar?: string; badge?: { key: string; icon: string; name: string; description: string } }
    reactions: { emoji: string; count: number; reacted: boolean }[]
  }[]

  for (const row of rows.results || []) {
    const reactionRows = await env.DB.prepare(
      'SELECT emoji, COUNT(*) as count FROM comment_reactions WHERE comment_id = ?1 GROUP BY emoji'
    ).bind(row.id).all<{ emoji: string; count: number }>()
    let userRows: { emoji: string }[] = []
    if (session?.user?.id) {
      const r = await env.DB.prepare(
        'SELECT emoji FROM comment_reactions WHERE comment_id = ?1 AND user_id = ?2'
      ).bind(row.id, session.user.id).all<{ emoji: string }>()
      userRows = r.results || []
    }
    const reactions = (reactionRows.results || []).map(r => ({
      emoji: r.emoji,
      count: r.count,
      reacted: userRows.some(u => u.emoji === r.emoji)
    }))
    const badgeKey = row.badge_key as keyof typeof BADGE_DEFINITIONS | null
    comments.push({
      id: row.id,
      text: row.content,
      created_at: new Date(row.created_at).toISOString(),
      user: {
        name: row.nickname || row.email,
        avatar: row.avatar ?? undefined,
        badge: badgeKey
          ? {
              key: badgeKey,
              icon: BADGE_DEFINITIONS[badgeKey].icon,
              name: BADGE_DEFINITIONS[badgeKey].name,
              description: BADGE_DEFINITIONS[badgeKey].description,
            }
          : undefined,
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
  const id = `com_${createId()}`
  await env.DB.prepare(
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

