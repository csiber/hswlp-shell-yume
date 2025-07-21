import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { consumeCredits, addCredits } from '@/utils/credits'
import { jsonResponse } from '@/utils/api'
import { ALBUM_PRICING_MODE, ALBUM_GROUP_CREDITS } from '@/constants'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> { params: Promise<T> }

export async function GET(req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  const dbDownloads = getDb(env, 'downloads')
  const dbRewards = getDb(env, 'upload_rewards')
  const { id } = await params
  const row = await db.prepare(
    'SELECT r2_key, download_points, user_id, type, album_id FROM uploads WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{ r2_key: string; download_points: number | null; user_id: string; type: string; album_id: string | null }>()

  if (!row) {
    return new Response('Not found', { status: 404 })
  }

  let points = row.download_points ?? 2
  if (row.album_id && ALBUM_PRICING_MODE === 'grouped') {
    const albumDownloaded = await db.prepare(
      'SELECT d.id FROM downloads d JOIN uploads u ON d.upload_id = u.id WHERE d.user_id = ?1 AND u.album_id = ?2 LIMIT 1'
    ).bind(session.user.id, row.album_id).first<{ id: string }>()
    if (albumDownloaded) {
      points = 0
    } else {
      points = ALBUM_GROUP_CREDITS
    }
  }
  const already = await dbDownloads.prepare(
    'SELECT id FROM downloads WHERE user_id = ?1 AND upload_id = ?2 LIMIT 1'
  ).bind(session.user.id, id).first<{ id: string }>()

  let alreadyDownloaded = false
  if (!already) {
    try {
      await consumeCredits({ userId: session.user.id, amount: points, description: 'File download' })
    } catch {
      return jsonResponse({ success: false, error: 'Insufficient credits' }, { status: 402 })
    }

    await dbDownloads.prepare(
      'INSERT INTO downloads (user_id, upload_id) VALUES (?1, ?2)'
    ).bind(session.user.id, id).run()
  } else {
    alreadyDownloaded = true
  }

  const object = await env.yumekai_r2.get(row.r2_key)
  if (!object?.body) {
    return new Response('File not found', { status: 404 })
  }

  await db.prepare('UPDATE uploads SET download_count = COALESCE(download_count,0) + 1 WHERE id = ?1')
    .bind(id)
    .run()

  if (!alreadyDownloaded && row.user_id !== session.user.id) {
    const existing = await dbRewards.prepare('SELECT id FROM upload_rewards WHERE upload_id = ?1 AND viewer_id = ?2 AND event = ?3')
      .bind(id, session.user.id, 'download')
      .first<{ id: string }>()
    if (!existing) {
      const reward = 0.5
      await dbRewards.prepare('INSERT INTO upload_rewards (id, upload_id, uploader_id, viewer_id, event, points_awarded) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
        .bind(uuidv4(), id, row.user_id, session.user.id, 'download', reward)
        .run()
      await addCredits({ userId: row.user_id, amount: reward, description: 'Reward from download' })
      await db.prepare('UPDATE uploads SET total_generated_points = COALESCE(total_generated_points,0) + ?2 WHERE id = ?1')
        .bind(id, reward)
        .run()
    }
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': object.httpMetadata?.contentType || row.type.startsWith('audio/') ? 'audio/mpeg' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${id}"`,
      'Cache-Control': 'no-store',
      'X-Already-Downloaded': alreadyDownloaded ? '1' : '0'
    }
  })
}
