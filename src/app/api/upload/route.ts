import { v4 as uuidv4 } from 'uuid'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { SITE_URL } from "@/constants"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'text/plain': 'txt',
    'text/markdown': 'md',
  }
  return map[mime] || 'bin'
}

export async function POST(req: Request) {
  const session = await getSessionFromCookie()

  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const title = formData.get('title')
  const type = formData.get('type')

  if (!(file instanceof Blob) || typeof title !== 'string' || typeof type !== 'string') {
    return jsonResponse({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  if (!['image', 'music', 'prompt'].includes(type)) {
    return jsonResponse({ success: false, error: 'Invalid type' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonResponse({ success: false, error: 'File too large' }, { status: 400 })
  }

  const ext = extFromMime(file.type)
  const id = uuidv4()
  const key = `uploads/${session.user.id}/${id}.${ext}`
  const { env } = getCloudflareContext()

  try {
    await env.hswlp_r2.put(key, file)

    const url = `${SITE_URL}/${key}`

    const exists = await env.DB.prepare(
      'SELECT id FROM uploads WHERE user_id = ?1 AND title = ?2 AND type = ?3 LIMIT 1'
    ).bind(session.user.id, title, type).first<string>()

    if (exists) {
      return jsonResponse({ success: false, error: 'Duplicate upload' }, { status: 400 })
    }

    await env.DB.prepare(
      'INSERT INTO uploads (id, user_id, title, type, url) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(id, session.user.id, title, type, url).run()

    return jsonResponse({ success: true, uploadId: id, url })
  } catch (err) {
    console.error(err)
    return jsonResponse({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
