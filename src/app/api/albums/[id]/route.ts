import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

interface RouteContext<T> {
  params: Promise<T>
}

export async function GET(_req: Request, { params }: RouteContext<{ id: string }>) {
  const { id } = await params
  const { env } = getCloudflareContext()
  const album = await env.DB.prepare(
    `SELECT a.id, a.name, a.user_id, a.created_at, u.nickname, u.email
       FROM albums a
       JOIN user u ON u.id = a.user_id
      WHERE a.id = ?1`
  ).bind(id).first<Record<string, string>>()
  if (!album) return jsonResponse({ success: false, error: 'Not found' }, { status: 404 })

  const rows = await env.DB.prepare(
    `SELECT id, title, mime, url, r2_key, "order" FROM uploads
     WHERE album_id = ?1
     ORDER BY CASE WHEN "order" IS NULL THEN 1 ELSE 0 END, "order", created_at DESC`
  ).bind(id).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const files: { id: string; title: string; mime: string | null; url: string; order: number | null }[] = []
  for (const row of rows.results || []) {
    let url = row.url
    if (publicBase && row.r2_key) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      url = `${base}${row.r2_key}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (row.r2_key && typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
      url = await getSignedUrl(env.yumekai_r2, row.r2_key)
    }
    files.push({ id: row.id, title: row.title, mime: row.mime, url, order: row.order ? Number(row.order) : null })
  }

  const author = album.nickname || album.email
  return jsonResponse({
    success: true,
    album: {
      id: album.id,
      name: album.name,
      user_id: album.user_id,
      created_at: album.created_at,
      author,
      files,
    },
  })
}
