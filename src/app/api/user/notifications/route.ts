import { jsonResponse } from '@/utils/api'
import { getSessionFromCookie } from '@/utils/auth'
import { getDB } from '@/db'
import { userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import type { NextRequest } from 'next/server'

const bodySchema = z.object({ enabled: z.boolean() })

export async function PUT(req: NextRequest) {
  return withRateLimit(async () => {
    const session = await getSessionFromCookie()
    if (!session?.user?.id) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const parse = bodySchema.safeParse(await req.json().catch(() => null))
    if (!parse.success) {
      return jsonResponse({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    const db = await getDB()
    await db.update(userTable).set({ emailNotificationsEnabled: parse.data.enabled ? 1 : 0 }).where(eq(userTable.id, session.user.id)).run()
    return jsonResponse({ success: true })
  }, RATE_LIMITS.SETTINGS)
}
