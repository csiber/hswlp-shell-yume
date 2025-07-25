import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'

interface RouteContext<T> { params: Promise<T> }

export async function GET(_req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const { id } = await params
  const { env } = getCloudflareContext()
  const session = await getSessionFromCookie()

  const row = await env.DB.prepare(`
    SELECT u.id, u.title, u.description, u.tags, u.note, u.type, u.url, u.r2_key,
           u.visibility, u.approved, usr.nickname, usr.email
      FROM uploads u
      JOIN user usr ON u.user_id = usr.id
     WHERE u.id = ?1
     LIMIT 1
  `).bind(id).first<Record<string, string>>()

  if (!row) return new Response('Not found', { status: 404 })

  const isPublic = row.visibility === 'public' && Number(row.approved) === 1
  if (!isPublic && !session?.user?.id) {
    return new Response('Not found', { status: 404 })
  }

  let fileUrl = row.url
  const publicBase = process.env.R2_PUBLIC_BASE_URL
  if (publicBase && row.r2_key) {
    const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
    fileUrl = `${base}${row.r2_key}`
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  else if (row.r2_key && typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
    fileUrl = await getSignedUrl(env.yumekai_r2, row.r2_key)
  }

  const post = {
    id: row.id,
    title: row.title,
    description: row.description,
    prompt: row.note,
    tags: row.tags,
    type: row.type,
    url: fileUrl,
    author: row.nickname || row.email,
    is_public: isPublic,
    is_nsfw: false,
  }

  return jsonResponse({ post })
}
