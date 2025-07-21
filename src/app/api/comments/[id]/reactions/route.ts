import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> {
  params: Promise<T>
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: commentId } = await params
  const { env } = getCloudflareContext()
  const db = getDb(env, 'comment_reactions')
  const session = await getSessionFromCookie()
  const rows = await db.prepare(
    'SELECT emoji, COUNT(*) as count FROM comment_reactions WHERE comment_id = ?1 GROUP BY emoji'
  ).bind(commentId).all<{ emoji: string; count: number }>()
  let userRows: { emoji: string }[] = []
  if (session?.user?.id) {
    const res = await db.prepare(
      'SELECT emoji FROM comment_reactions WHERE comment_id = ?1 AND user_id = ?2'
    ).bind(commentId, session.user.id).all<{ emoji: string }>()
    userRows = res.results || []
  }
  const reactions = (rows.results || []).map(r => ({
    emoji: r.emoji,
    count: r.count,
    reacted: userRows.some(u => u.emoji === r.emoji)
  }))
  return jsonResponse({ reactions })
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: commentId } = await params
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { emoji } = (await req.json()) as { emoji?: string }
  if (!emoji) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const db = getDb(env, 'comment_reactions')
  try {
    await db.prepare(
      'INSERT INTO comment_reactions (id, comment_id, user_id, emoji) VALUES (?1, ?2, ?3, ?4)'
    ).bind(`cre_${uuidv4()}`, commentId, session.user.id, emoji).run()
  } catch (e) {
    console.error(e)
    // ignore duplicates
  }
  return jsonResponse({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: commentId } = await params
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { emoji } = (await req.json()) as { emoji?: string }
  if (!emoji) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  const db = getDb(env, 'comment_reactions')
  await db.prepare(
    'DELETE FROM comment_reactions WHERE comment_id = ?1 AND user_id = ?2 AND emoji = ?3'
  ).bind(commentId, session.user.id, emoji).run()
  return jsonResponse({ success: true })
}
