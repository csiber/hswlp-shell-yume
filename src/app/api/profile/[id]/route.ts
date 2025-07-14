import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'

interface RouteContext<T> {
  params: Promise<T>
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id } = await params
  const { env } = getCloudflareContext()
  const user = await env.DB.prepare(
    'SELECT id, firstName, lastName, email, avatar, currentCredits FROM user WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{
    id: string; firstName: string | null; lastName: string | null; email: string; avatar: string | null; currentCredits: number | null
  }>()

  if (!user) {
    return new Response('Not found', { status: 404 })
  }

  const uploads = await env.DB.prepare(
    'SELECT id, title, type, url, r2_key, created_at FROM uploads WHERE user_id = ?1 ORDER BY created_at DESC'
  ).bind(id).all<{
    id: string; title: string; type: string; url: string; r2_key: string; created_at: string
  }>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items = [] as {
    id: string
    type: 'image' | 'music' | 'prompt'
    url: string
    name: string
    created_at: string
  }[]

  for (const row of uploads.results || []) {
    let fileUrl: string
    if (publicBase) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (typeof (env.hswlp_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }
    items.push({
      id: row.id,
      type: row.type as 'image' | 'music' | 'prompt',
      url: fileUrl,
      name: row.title,
      created_at: new Date(row.created_at).toISOString(),
    })
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return jsonResponse({
    user: {
      id: user.id,
      name: fullName || user.email,
      email: user.email,
      avatar: user.avatar,
      credits: user.currentCredits ?? 0,
    },
    uploads: items,
  })
}
