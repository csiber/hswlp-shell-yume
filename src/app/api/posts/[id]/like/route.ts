import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { init } from '@paralleldrive/cuid2'

const createId = init({ length: 32 })

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  try {
    await env.DB.prepare(
      'INSERT INTO post_likes (id, post_id, user_id) VALUES (?1, ?2, ?3)'
    ).bind(`like_${createId()}`, params.id, session.user.id).run()
  } catch {
    // ignore duplicates
  }
  return jsonResponse({ success: true })
}

