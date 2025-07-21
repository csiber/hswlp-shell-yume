import { getGlobalDB } from '@/db'
import { userTable } from '@/db/schema'
import { hashPassword } from '@/utils/password-hasher'
import { signJWT } from '@/utils/jwt'
import { jsonResponse } from '@/utils/api'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'

export const onRequestPost = async (req: Request) => {
  try {
    const { email, password, firstName, lastName } = await req.json() as { email?: string; password?: string; firstName?: string; lastName?: string }
    if (!email || !password) {
      return jsonResponse({ error: 'Missing data' }, { status: 400 })
    }
    const db = await getGlobalDB()

    const existing = await db.query.userTable.findFirst({ where: eq(userTable.email, email) })
    if (existing) {
      return jsonResponse({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword({ password })
    const nickname = `user_${createId().slice(0,8)}`
    const [user] = await db.insert(userTable)
      .values({ email, firstName, lastName, passwordHash, nickname, emailVerified: new Date() })
      .returning()

    const { env } = getCloudflareContext()
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
