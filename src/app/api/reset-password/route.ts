import { jsonResponse } from '@/utils/api'
import { resetPasswordSchema } from '@/schemas/reset-password.schema'
import { getDB } from '@/db'
import { userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getKV } from '@/utils/kv-session'
import { getResetTokenKey } from '@/utils/auth-utils'
import { hashPassword } from '@/utils/password-hasher'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return withRateLimit(async () => {
    const parse = resetPasswordSchema.safeParse(await req.json().catch(() => null))
    if (!parse.success) {
      return jsonResponse({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    const { token, password } = parse.data
    const kv = await getKV()
    const userId = await kv.get(getResetTokenKey(token))
    if (!userId) {
      return jsonResponse({ success: false, error: 'Invalid token' }, { status: 400 })
    }
    const hashed = await hashPassword({ password })
    const db = await getDB()
    await db.update(userTable).set({ passwordHash: hashed }).where(eq(userTable.id, userId)).run()
    await kv.delete(getResetTokenKey(token))
    return jsonResponse({ success: true })
  }, RATE_LIMITS.RESET_PASSWORD)
}
