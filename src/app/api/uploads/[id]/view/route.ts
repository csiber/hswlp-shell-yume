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
  await db.prepare('UPDATE uploads SET view_count = COALESCE(view_count,0) + 1 WHERE id = ?1')
    .bind(id)
    .run()
  const row = await db.prepare('SELECT view_count, user_id FROM uploads WHERE id = ?1')
    .bind(id)
    .first<{ view_count: number; user_id: string }>()

  if (viewerId && row && row.user_id !== viewerId) {
    const existing = await dbRewards.prepare('SELECT id, points_awarded FROM upload_rewards WHERE upload_id = ?1 AND viewer_id = ?2 AND event = ?3')
      .bind(id, viewerId, 'view')
      .first<{ id: string; points_awarded: number }>()
    let reward = 0
    if (!existing) {
      reward = 0.1
      await dbRewards.prepare('INSERT INTO upload_rewards (id, upload_id, uploader_id, viewer_id, event, points_awarded) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
        .bind(uuidv4(), id, row.user_id, viewerId, 'view', reward)
        .run()
    } else if (existing.points_awarded < 3) {
      reward = Math.min(0.1, 3 - existing.points_awarded)
      if (reward > 0) {
        await dbRewards.prepare('UPDATE upload_rewards SET points_awarded = points_awarded + ?2 WHERE id = ?1')
          .bind(existing.id, reward)
          .run()
      }
    }
    if (reward > 0) {
      await addCredits({ userId: row.user_id, amount: reward, description: 'Reward from view' })
      await db.prepare('UPDATE uploads SET total_generated_points = COALESCE(total_generated_points,0) + ?2 WHERE id = ?1')
        .bind(id, reward)
        .run()
    }
  }

  return jsonResponse({ success: true, view_count: row?.view_count ?? 0 })
}
