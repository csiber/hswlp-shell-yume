import { drizzle } from 'drizzle-orm/d1'
import { userTable } from '@/db/schema'
import * as schema from '@/db/schema'
import { hashPassword } from '@/utils/password-hasher'
import { signJWT } from '@/utils/jwt'
import { jsonResponse } from '@/utils/api'
import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'

export const onRequestPost: PagesFunction<CloudflareEnv> = async ({ request, env }) => {
  try {
    const { email, password, firstName, lastName } = await request.json() as { email?: string; password?: string; firstName?: string; lastName?: string }
    if (!email || !password) {
      return jsonResponse({ error: 'Missing data' }, { status: 400 })
    }
    const db = drizzle(env.DB_GLOBAL as D1Database, { schema })

    const existing = await db.query.userTable.findFirst({ where: eq(userTable.email, email) })
    if (existing) {
      return jsonResponse({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword({ password })
    const nickname = `user_${createId().slice(0,8)}`
    const [user] = await db.insert(userTable)
      .values({ email, firstName, lastName, passwordHash, nickname, emailVerified: new Date() })
      .returning()

    if (!env.JWT_SECRET) {
      return jsonResponse({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const token = await signJWT({ sub: user.id, exp: Math.floor(Date.now()/1000)+60*60*24*7 }, env.JWT_SECRET)

    return jsonResponse({ token, user: { id: user.id, email: user.email, nickname: user.nickname } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return jsonResponse({ error: 'Unexpected error' }, { status: 500 })
  }
}
