import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { withTimeout } from '@/utils/with-timeout'

export async function GET() {
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT id, title, type, r2_key
       FROM uploads
      WHERE approved = 1 AND visibility = 'public'
        AND (moderation_status IS NULL OR moderation_status = 'approved')
      ORDER BY created_at DESC
      LIMIT 50`
  ).all<{ id: string; title: string; type: string; r2_key: string | null }>()

  const items = [] as { id: string; name: string; type: string; size: number | null }[]
  for (const row of rows.results || []) {
    let size: number | null = null
    if (row.r2_key) {
      let obj: R2Object | string | null = null
      try {
        obj = await withTimeout(env.yumekai_r2.head(row.r2_key), 2000)
      } catch (err) {
        console.error('R2 head failed', err)
        obj = 'Failed to load file'
      }
      size = obj && typeof obj !== 'string' ? obj.size ?? null : null
    }
    items.push({ id: row.id, name: row.title, type: row.type, size })
  }

  return jsonResponse({ items })
}
