import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ used: 0, limit: 0 }, { status: 401 })
  }
  return jsonResponse({ used: session.user.usedStorageMb ?? 0, limit: session.user.uploadLimitMb ?? 0 })
}
