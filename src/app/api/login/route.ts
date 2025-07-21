import { getGlobalDB } from '@/db'
import { userTable } from '@/db/schema'
import { verifyPassword } from '@/utils/password-hasher'
import { signJWT } from '@/utils/jwt'
import { jsonResponse } from '@/utils/api'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { eq } from 'drizzle-orm'

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    if (!email || !password) {
      return jsonResponse({ error: 'Missing credentials' }, { status: 400 })
    }

    const db = await getGlobalDB()
    const [user] = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1)

    if (!user || !user.passwordHash) {
      return jsonResponse({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await verifyPassword({ storedHash: user.passwordHash, passwordAttempt: password })
    if (!isValid) {
      return jsonResponse({ error: 'Invalid credentials' }, { status: 401 })
    }

    const { env } = getCloudflareContext()
    if (!env.JWT_SECRET) {
      return jsonResponse({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const token = await signJWT({ sub: user.id, exp: Math.floor(Date.now()/1000)+60*60*24*7 }, env.JWT_SECRET)

    return jsonResponse({ token, user: { id: user.id, email: user.email, nickname: user.nickname } })
  } catch (err) {
    console.error(err)
    return jsonResponse({ error: 'Unexpected error' }, { status: 500 })
  }
}
