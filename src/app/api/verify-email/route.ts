import { jsonResponse } from '@/utils/api'
import { verifyEmailSchema } from '@/schemas/verify-email.schema'
import { getKV } from '@/utils/kv-session'
import { getVerificationTokenKey } from '@/utils/auth-utils'
import { getDB } from '@/db'
import { userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { updateAllSessionsOfUser } from '@/utils/kv-session'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return withRateLimit(async () => {
    const parse = verifyEmailSchema.safeParse(await req.json().catch(() => null))
    if (!parse.success) {
      return jsonResponse({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    const { token } = parse.data
    const kv = await getKV()
    const userId = await kv.get(getVerificationTokenKey(token))
    if (!userId) {
      return jsonResponse({ success: false, error: 'Invalid token' }, { status: 400 })
    }
    const db = await getDB()
    await db.update(userTable).set({ emailVerified: new Date() }).where(eq(userTable.id, userId)).run()
    await kv.delete(getVerificationTokenKey(token))
    await updateAllSessionsOfUser(userId)
    return jsonResponse({ success: true })
  }, RATE_LIMITS.EMAIL)
}
