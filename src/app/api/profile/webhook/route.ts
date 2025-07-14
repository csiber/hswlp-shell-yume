import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function PUT(req: Request) {
  const { url } = await req.json() as { url: string }
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { env } = getCloudflareContext()
  await env.DB.prepare(
    'INSERT OR REPLACE INTO webhooks (id, user_id, url, enabled) VALUES (?1, ?2, ?3, 1)'
  ).bind(session.user.id, session.user.id, url).run()

  return new Response('OK')
}
