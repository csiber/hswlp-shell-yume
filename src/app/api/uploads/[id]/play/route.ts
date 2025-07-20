import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/utils/auth'
import { addCredits } from '@/utils/credits'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> { params: Promise<T> }

export async function POST(_req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  const viewerId = session?.user?.id
  const { id } = await params
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const dbRewards = getDb(env, 'upload_rewards')
  await db.prepare('UPDATE uploads SET play_count = COALESCE(play_count,0) + 1 WHERE id = ?1')
    .bind(id)
    .run()
  const row = await db.prepare('SELECT play_count, user_id, mime FROM uploads WHERE id = ?1')
    .bind(id)
    .first<{ play_count: number; user_id: string; mime: string | null }>()

  if (viewerId && row && row.user_id !== viewerId && (row.mime?.startsWith('audio/') ?? false)) {
    const existing = await dbRewards.prepare('SELECT id FROM upload_rewards WHERE upload_id = ?1 AND viewer_id = ?2 AND event = ?3')
      .bind(id, viewerId, 'play')
      .first<{ id: string }>()
    if (!existing) {
      const reward = 0.3
      await dbRewards.prepare('INSERT INTO upload_rewards (id, upload_id, uploader_id, viewer_id, event, points_awarded) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
        .bind(uuidv4(), id, row.user_id, viewerId, 'play', reward)
        .run()
      await addCredits({ userId: row.user_id, amount: reward, description: 'Reward from play' })
      await db.prepare('UPDATE uploads SET total_generated_points = COALESCE(total_generated_points,0) + ?2 WHERE id = ?1')
        .bind(id, reward)
        .run()
    }
  }

  return jsonResponse({ success: true, play_count: row?.play_count ?? 0 })
}
