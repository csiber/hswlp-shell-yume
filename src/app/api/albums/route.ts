import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { randomUUID } from 'crypto'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT a.id, a.name, a.created_at, a.cover_file_id, up.r2_key,
            COUNT(u.id) as count
       FROM albums a
       LEFT JOIN uploads up ON up.id = a.cover_file_id
       LEFT JOIN uploads u ON u.album_id = a.id
      WHERE a.user_id = ?1
      GROUP BY a.id
      ORDER BY a.created_at DESC`
  ).bind(session.user.id).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const albums: { id: string; name: string; created_at: string; cover_url: string | null; count: number }[] = []
  for (const row of rows.results || []) {
    let url: string | null = null
    if (row.r2_key) {
      if (publicBase) {
        const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
        url = `${base}${row.r2_key}`
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else if (typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
        url = await getSignedUrl(env.yumekai_r2, row.r2_key)
      }
    }
    albums.push({
      id: row.id,
      name: row.name,
      created_at: row.created_at,
      cover_url: url,
      count: Number(row.count || 0)
    })
  }

  return jsonResponse({ success: true, albums })
}

export async function POST(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) return jsonResponse({ success: false }, { status: 401 })
  const { name } = (await req.json()) as { name?: string }
  if (!name) return jsonResponse({ success: false, error: 'Name required' }, { status: 400 })
  const { env } = getCloudflareContext()
  const id = `alb_${randomUUID()}`
  await env.DB.prepare(
    'INSERT INTO albums (id, name, user_id) VALUES (?1, ?2, ?3)'
  ).bind(id, name, session.user.id).run()
  return jsonResponse({ success: true, id })
}
