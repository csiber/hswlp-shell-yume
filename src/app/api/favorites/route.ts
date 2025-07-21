import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ items: [] }, { status: 401 })
  }

  const { env } = getCloudflareContext()
  const dbUploads = getDb(env, 'uploads')
  const rows = await dbUploads.prepare(`
    SELECT up.id, up.title, up.type, up.mime, up.url, up.r2_key, f.created_at
    FROM uploads up
    JOIN favorites f ON f.upload_id = up.id
    WHERE f.user_id = ?1
    ORDER BY f.created_at DESC
  `).bind(session.user.id).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items: { id: string; title: string; category: 'image' | 'music' | 'prompt'; mime: string | null; url: string }[] = []

  for (const row of rows.results || []) {
    let fileUrl: string
    if (publicBase && row.r2_key) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (row.r2_key && typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.yumekai_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }
    items.push({
      id: row.id,
      title: row.title,
      category: row.type as 'image' | 'music' | 'prompt',
      mime: row.mime,
      url: fileUrl,
    })
  }

  return jsonResponse({ items })
}
