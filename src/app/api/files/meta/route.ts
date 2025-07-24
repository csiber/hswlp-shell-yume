import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT id, title, type, r2_key FROM uploads ORDER BY created_at DESC LIMIT 50`
  ).all<{ id: string; title: string; type: string; r2_key: string | null }>()

  const items = [] as { id: string; name: string; type: string; size: number | null }[]
  for (const row of rows.results || []) {
    let size: number | null = null
    if (row.r2_key) {
      const obj = await env.yumekai_r2.head(row.r2_key)
      size = obj?.size ?? null
    }
    items.push({ id: row.id, name: row.title, type: row.type, size })
  }

  return jsonResponse({ items })
}
