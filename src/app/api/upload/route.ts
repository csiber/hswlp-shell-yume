import { v4 as uuidv4 } from 'uuid'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { WebhookService } from '@/app/services/WebhookService'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { CREDIT_TRANSACTION_TYPE } from '@/db/schema'
import { calculateUploadCredits } from '@/utils/upload-credits'
import { parseBuffer } from 'music-metadata-browser'

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
  const promptField = formData.get('prompt')
  const artist = formData.get('artist')
  const album = formData.get('album')
  const picture = formData.get('picture')
  const linkedUploadId = formData.get('linked_upload_id')
  const tags = formData.getAll('tags').flatMap((t) =>
    typeof t === 'string' ? t.split(',').map((s) => s.trim()).filter(Boolean) : []
  )

  if (!(file instanceof Blob) || typeof title !== 'string' || typeof type !== 'string') {
    return jsonResponse({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  if (!['image', 'music', 'prompt'].includes(type)) {
    return jsonResponse({ success: false, error: 'Invalid type' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonResponse({ success: false, error: 'File too large' }, { status: 400 })
  }

  // MIME ellenőrzés
  const mime = file.type
  if (
    (type === 'image' && !mime.startsWith('image/')) ||
    (type === 'music' && !mime.startsWith('audio/')) ||
    (type === 'prompt' && !mime.startsWith('text/'))
  ) {
    return jsonResponse({ success: false, error: 'MIME mismatch' }, { status: 400 })
  }

  const ext = extFromMime(mime)
  const id = uuidv4()
  const key = `uploads/${session.user.id}/${id}.${ext}`
  const { env } = getCloudflareContext()

  // Calculate download points based on metadata
  let downloadPoints = 2
  try {
    if (type === 'music') {
      const buffer = await file.arrayBuffer()
      const meta = await parseBuffer(Buffer.from(buffer), mime)
      const common = meta.common || {}
      if (common.title || common.artist || common.album) downloadPoints++
      if (common.picture && common.picture.length > 0) downloadPoints++
      if (meta.format?.duration && meta.format.duration > 120 && mime === 'audio/mpeg') {
        downloadPoints++
      }
    }
    const countRow = await env.DB.prepare('SELECT COUNT(*) as c FROM uploads WHERE user_id = ?1')
      .bind(session.user.id)
      .first<{ c: number }>()
    if ((countRow?.c ?? 0) === 0) downloadPoints++
  } catch (err) {
    console.warn('Failed to calculate download points', err)
  }
  if (downloadPoints > 5) downloadPoints = 5

  let promptText: string | undefined
  if (type === 'prompt') {
    promptText = await file.text()
  } else if (typeof promptField === 'string') {
    promptText = promptField
  }

  try {
    await env.hswlp_r2.put(key, file)

    const url = `/api/files/${id}` // helyi proxy link, védett!

    const creditValue = calculateUploadCredits({
      type: type as 'image' | 'music' | 'prompt',
      title,
      promptText,
      artist: typeof artist === 'string' ? artist : undefined,
      album: typeof album === 'string' ? album : undefined,
      picture: typeof picture === 'string' ? picture : undefined,
      tags,
      linkedUploadId: typeof linkedUploadId === 'string' ? linkedUploadId : undefined,
      hasR2: true,
    })

    const exists = await env.DB.prepare(
      'SELECT id FROM uploads WHERE user_id = ?1 AND title = ?2 AND type = ?3 LIMIT 1'
    ).bind(session.user.id, title, type).first<string>()

    if (exists) {
      return jsonResponse({ success: false, error: 'Duplicate upload' }, { status: 400 })
    }

    await env.DB.prepare(
      'INSERT INTO uploads (id, user_id, title, type, url, r2_key, credit_value, download_points, approved) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0)'
    ).bind(id, session.user.id, title, type, url, key, creditValue, downloadPoints).run()

    await updateUserCredits(session.user.id, creditValue)
    await logTransaction({
      userId: session.user.id,
      amount: creditValue,
      description: `Upload reward (${type})`,
      type: CREDIT_TRANSACTION_TYPE.UPLOAD_REWARD,
    })

    const creditsRow = await env.DB.prepare('SELECT currentCredits FROM user WHERE id = ?1')
      .bind(session.user.id)
      .first<{ currentCredits: number }>()

    await WebhookService.dispatch(session.user.id, 'upload_created', { upload_id: id })

    return jsonResponse({
      success: true,
      uploadId: id,
      url,
      message: 'Feltöltés sikeres!',
      download_points: downloadPoints,
      awarded_credits: creditValue,
      total_credits: creditsRow?.currentCredits ?? null,
    })
  } catch (err) {
    console.error(err)
    return jsonResponse({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
