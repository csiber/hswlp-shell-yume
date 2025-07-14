import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { group_id } = (await req.json()) as { group_id?: string }
  if (!group_id) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  const { env } = getCloudflareContext()
  await env.DB.prepare(
    'INSERT OR IGNORE INTO group_members (id, user_id, group_id) VALUES (?1, ?2, ?3)'
  ).bind(`gmem_${uuidv4()}`, session.user.id, group_id).run()
  return jsonResponse({ success: true })
}
