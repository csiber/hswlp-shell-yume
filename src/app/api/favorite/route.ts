import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { FavoriteService } from '@/app/services/FavoriteService'

export async function POST(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { upload_id } = (await req.json()) as { upload_id?: string }
  if (!upload_id) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  await FavoriteService.add(session.user.id, upload_id)
  return jsonResponse({ success: true })
}

export async function DELETE(req: Request) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 })
  }
  const { upload_id } = (await req.json()) as { upload_id?: string }
  if (!upload_id) {
    return jsonResponse({ success: false }, { status: 400 })
  }
  await FavoriteService.remove(session.user.id, upload_id)
  return jsonResponse({ success: true })
}
