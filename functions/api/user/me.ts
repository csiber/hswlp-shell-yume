import { getDB } from '@/db'
import { userTable } from '@/db/schema'
import { verifyJWT } from '@/utils/jwt'
import { jsonResponse } from '@/utils/api'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { eq } from 'drizzle-orm'

export const onRequestGet = async (req: Request) => {
  try {
    const auth = req.headers.get('Authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return jsonResponse({ user: null }, { status: 401 })

    const { env } = getCloudflareContext()
    if (!env.JWT_SECRET) return jsonResponse({ user: null }, { status: 500 })

    const payload = await verifyJWT(token, env.JWT_SECRET)
    if (!payload || typeof payload.sub !== 'string') {
      return jsonResponse({ user: null }, { status: 401 })
    }
    const db = await getDB()
    const user = await db.query.userTable.findFirst({ where: eq(userTable.id, payload.sub) })
    if (!user) return jsonResponse({ user: null }, { status: 404 })

    return jsonResponse({ user: { id: user.id, email: user.email, nickname: user.nickname } })
  } catch (err) {
    console.error(err)
    return jsonResponse({ user: null }, { status: 500 })
  }
}
