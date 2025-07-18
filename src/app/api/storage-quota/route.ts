import { getSessionFromCookie, getUserFromDB } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ used: 0, limit: 0 }, { status: 401 })
  }
  const user = await getUserFromDB(session.user.id)

  return jsonResponse({
    used: user?.usedStorageMb ?? session.user.usedStorageMb ?? 0,
    limit: user?.uploadLimitMb ?? session.user.uploadLimitMb ?? 0,
  })
}
