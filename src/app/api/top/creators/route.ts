import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/utils/db'

export async function GET(request: Request) {
  const { env } = getCloudflareContext()
  const dbUser = getDb(env, 'DB_GLOBAL')
  const url = new URL(request.url)
  const days = Number(url.searchParams.get('days') ?? '1')
  const limit = Number(url.searchParams.get('limit') ?? '10')
  const rows = await dbUser.prepare(
    `SELECT uploader_id, SUM(points_awarded) as pts
     FROM upload_rewards
     WHERE created_at >= datetime('now', ?1)
     GROUP BY uploader_id
     ORDER BY pts DESC
     LIMIT ?2`
  ).bind(`-${days} day`, limit).all<{ uploader_id: string; pts: number }>()

  const creators = [] as { id: string; nickname: string; avatar: string | null; points: number }[]
  for (const r of rows.results || []) {
    const user = await dbUser.prepare(
      'SELECT id, nickname, avatar FROM user WHERE id = ?1'
    ).bind(r.uploader_id).first<{ id: string; nickname: string; avatar: string | null }>()
    if (user) {
      creators.push({ id: user.id, nickname: user.nickname, avatar: user.avatar ?? null, points: r.pts })
    }
  }

  return jsonResponse({ creators })
}
