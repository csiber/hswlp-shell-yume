import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { init } from '@paralleldrive/cuid2'
import { getDb } from '@/lib/getDb'
interface RouteContext<T> {
  params: Promise<T>
}

const createId = init({ length: 32 })

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id } = await params
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  const db = getDb(env, 'post_likes')
  try {
    await db.prepare(
      'INSERT INTO post_likes (id, post_id, user_id) VALUES (?1, ?2, ?3)'
    ).bind(`like_${createId()}`, id, session.user.id).run()
  } catch (e) {
    console.error(e)
    // ignore duplicates
  }
  return jsonResponse({ success: true })
}

