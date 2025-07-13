import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { env } = getCloudflareContext()
  await env.DB.prepare(
    'DELETE FROM post_likes WHERE post_id = ?1 AND user_id = ?2'
  ).bind(params.id, session.user.id).run()
  return jsonResponse({ success: true })
}

