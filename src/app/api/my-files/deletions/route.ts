// src/app/api/my-files/deletions/route.ts

import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getDb } from '@/lib/getDb'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { env } = getCloudflareContext()
  const db = getDb(env, 'deletions')

  const result = await db.prepare(`
    SELECT d.id, d.upload_id, d.deleted_at, u.title, u.type
    FROM deletions d
    LEFT JOIN uploads u ON d.upload_id = u.id
    WHERE d.user_id = ?1
    ORDER BY d.deleted_at DESC
    LIMIT 50
  `).bind(session.user.id).all()

  return jsonResponse({ success: true, deletions: result.results })
}
