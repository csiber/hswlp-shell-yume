import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext()
  const album = await env.DB.prepare(
    'SELECT id, name, user_id, created_at FROM albums WHERE id = ?1'
  ).bind(params.id).first<Record<string, string>>()
  if (!album) return jsonResponse({ success: false, error: 'Not found' }, { status: 404 })

  const rows = await env.DB.prepare(
    'SELECT id, title, mime, url, r2_key FROM uploads WHERE album_id = ?1 ORDER BY created_at'
  ).bind(params.id).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const files: { id: string; title: string; mime: string | null; url: string }[] = []
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
    files.push({ id: row.id, title: row.title, mime: row.mime, url })
  }

  return jsonResponse({ success: true, album: { ...album, files } })
}
