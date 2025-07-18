import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface RouteContext<T> {
  params: Promise<T>
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id: commentId } = await params
  const { env } = getCloudflareContext()
  const session = await getSessionFromCookie()
  const rows = await env.DB.prepare(
    'SELECT emoji, COUNT(*) as count FROM comment_reactions WHERE comment_id = ?1 GROUP BY emoji'
  ).bind(commentId).all<{ emoji: string; count: number }>()
  let userRows: { emoji: string }[] = []
  if (session?.user?.id) {
    const res = await env.DB.prepare(
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
  try {
    await env.DB.prepare(
      'INSERT INTO comment_reactions (id, comment_id, user_id, emoji) VALUES (?1, ?2, ?3, ?4)'
    ).bind(`cre_${uuidv4()}`, commentId, session.user.id, emoji).run()
  } catch {
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
  await env.DB.prepare(
    'DELETE FROM comment_reactions WHERE comment_id = ?1 AND user_id = ?2 AND emoji = ?3'
  ).bind(commentId, session.user.id, emoji).run()
  return jsonResponse({ success: true })
}
