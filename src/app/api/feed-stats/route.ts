import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const { env } = getCloudflareContext()
  const row = await env.DB.prepare(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN type = 'image' OR mime LIKE 'image/%' THEN 1 ELSE 0 END) as images,
       SUM(CASE WHEN type = 'music' OR mime LIKE 'audio/%' THEN 1 ELSE 0 END) as music,
       SUM(CASE WHEN type = 'prompt' OR mime LIKE 'text/%' THEN 1 ELSE 0 END) as prompts
     FROM uploads
     WHERE approved = 1 AND visibility = 'public'
       AND (moderation_status IS NULL OR moderation_status = 'approved')`
  ).first<{ total: number; images: number; music: number; prompts: number }>()

  return jsonResponse({
    total: row?.total ?? 0,
    images: row?.images ?? 0,
    music: row?.music ?? 0,
    prompts: row?.prompts ?? 0,
  })
}
