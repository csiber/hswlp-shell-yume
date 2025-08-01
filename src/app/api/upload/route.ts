import { v4 as uuidv4 } from 'uuid'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie, getUserFromDB } from '@/utils/auth'
import { MAX_ALBUM_UPLOAD } from '@/constants'
import { jsonResponse } from '@/utils/api'
import { WebhookService } from '@/app/services/WebhookService'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { updateAllSessionsOfUser } from '@/utils/kv-session'
import { CREDIT_TRANSACTION_TYPE, ROLES_ENUM } from '@/db/schema'
import { calculateUploadCredits } from '@/utils/upload-credits'
import { parseID3, type SimpleID3Data } from '@/utils/simple-id3'
import { formatTitle } from '@/utils/music'
import { withTimeout } from '@/utils/with-timeout'
import { createId } from '@paralleldrive/cuid2'
import { generateRandomName } from '@/utils/random-name'
import { sendEmail } from '@/utils/email'
import { renderModerationEmail } from '@/utils/moderation-email'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

const banned = /(loli|shota|hentai|rape|guro|nude|sexual|porn|fuck|pussy|underage|bdsm|nsfw|abuse|boob|tits|cum)/i
const maliciousHtml = /<script|<iframe|<object|<embed|javascript:/i

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

function sniffImageMime(buf: Uint8Array): string | null {
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buf.length >= 12 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return 'image/webp'
  }
  return null
}

async function isNsfwImage(file: Blob, env: CloudflareEnv): Promise<boolean> {
  const url = env.NSFW_CHECK_URL
  const key = env.NSFW_CHECK_KEY
  if (!url || !key) return false
  try {
    const fd = new FormData()
    fd.append('image', file, 'img')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'api-key': key },
      body: fd,
      cf: {
        cacheTtl: 86400,
        cacheEverything: true,
      },
    })
    if (!res.ok) return false
    const data = (await res.json()) as { nsfw_score?: number }
    return (data.nsfw_score ?? 0) >= 0.5
  } catch (err) {
    console.warn('NSFW check failed', err)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookie()

  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  let targetUserId = session.user.id
  if (session.user.role === ROLES_ENUM.ADMIN) {
    const asUser = formData.get('as_user')
    if (typeof asUser === 'string' && asUser.trim()) {
      targetUserId = asUser.trim()
    }
  }

  const freshUser = await getUserFromDB(targetUserId)

  if (!freshUser) {
    return jsonResponse({ success: false, error: 'User not found' }, { status: 404 })
  }

  if (freshUser.uploadBanUntil && new Date(freshUser.uploadBanUntil) > new Date()) {
    return jsonResponse({ success: false, error: 'Uploads temporarily disabled' }, { status: 403 })
  }

  const file = formData.get('file')
  const titleField = formData.get('title')
  const title = typeof titleField === 'string' ? titleField : ''
  const type = formData.get('type')
  const promptField = formData.get('prompt')
  const artist = formData.get('artist')
  const album = formData.get('album')
  const albumIdField = formData.get('album_id')
  const albumNameField = formData.get('album_name')
  const picture = formData.get('picture')
  const linkedUploadId = formData.get('linked_upload_id')
  const tags = formData.getAll('tags').flatMap((t) =>
    typeof t === 'string' ? t.split(',').map((s) => s.trim()).filter(Boolean) : []
  )
  const albumId = typeof albumIdField === 'string' ? albumIdField : null
  const albumName = typeof albumNameField === 'string' ? albumNameField.trim() : null

  if (!(file instanceof Blob) || typeof type !== 'string') {
    return jsonResponse({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  if (!['image', 'music', 'prompt'].includes(type)) {
    return jsonResponse({ success: false, error: 'Invalid type' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonResponse({ success: false, error: 'File too large' }, { status: 400 })
  }

  // MIME validation
  let mime = file.type
  if (
    (type === 'image' && !mime.startsWith('image/')) ||
    (type === 'music' && !mime.startsWith('audio/')) ||
    (type === 'prompt' && !mime.startsWith('text/'))
  ) {
    return jsonResponse({ success: false, error: 'MIME mismatch' }, { status: 400 })
  }

  if (type === 'image') {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
    const sniffed = sniffImageMime(head)
    if (!sniffed || !['image/png', 'image/jpeg', 'image/webp'].includes(sniffed)) {
      return jsonResponse({ success: false, error: 'Unsupported image type' }, { status: 400 })
    }
    mime = sniffed
  }

  const { env } = getCloudflareContext()

  const fileSizeMb = file.size / (1024 * 1024)
  const usedStorageMb = Number(freshUser?.usedStorageMb ?? 0)
  const uploadLimitMb = Number(freshUser?.uploadLimitMb ?? 0)
  if (usedStorageMb + fileSizeMb > uploadLimitMb) {
    throw new Error('Storage quota exceeded. Purchase more on the Marketplace.')
  }

  let meta: SimpleID3Data | null = null
  let arrayBuffer: ArrayBuffer | null = null
  if (type === 'music') {
    try {
      arrayBuffer = await file.arrayBuffer()
      meta = parseID3(arrayBuffer)
    } catch (err) {
      console.warn('Failed to parse music metadata', err)
    }
  }

  let finalTitle = title
  if (type === 'image' && !title.trim()) {
    finalTitle = generateRandomName()
  }
  if (type === 'music' && meta) {
    const t = meta.title ? formatTitle(meta.title) : formatTitle(title)
    finalTitle = meta.artist ? `${meta.artist} - ${t}` : t
  }
  if (type === 'music' && !meta) {
    finalTitle = formatTitle(title)
  }

  if (type === 'image' && await isNsfwImage(file, env)) {
      return jsonResponse({ success: false, error: 'NSFW content detected' }, { status: 400 })
    }

  if (albumId) {
    const countRow = await env.DB.prepare('SELECT COUNT(*) as c FROM uploads WHERE album_id = ?1')
      .bind(albumId)
      .first<{ c: number }>()
    if ((countRow?.c ?? 0) >= MAX_ALBUM_UPLOAD) {
      return jsonResponse({ success: false, error: 'Album limit reached' }, { status: 400 })
    }
    const existsAlbum = await env.DB.prepare('SELECT id FROM albums WHERE id = ?1 LIMIT 1')
      .bind(albumId)
      .first<{ id: string }>()
    if (!existsAlbum) {
      if (!albumName) {
        return jsonResponse({ success: false, error: 'Album name required' }, { status: 400 })
      }
      await env.DB.prepare(
        'INSERT INTO albums (id, name, user_id) VALUES (?1, ?2, ?3)'
      ).bind(albumId, albumName, targetUserId).run()
    }
  }

  const ext = extFromMime(mime)
  const id = uuidv4()
  const key = `uploads/${targetUserId}/${id}.${ext}`

  // Calculate download points based on metadata
  let downloadPoints = 2
  let userUploadCount = 0
  try {
    if (type === 'music' && meta) {
      if (meta.title || meta.artist || meta.album) downloadPoints++
      if (meta.picture) downloadPoints++
    }
    const countRow = await env.DB.prepare('SELECT COUNT(*) as c FROM uploads WHERE user_id = ?1')
      .bind(targetUserId)
      .first<{ c: number }>()
    userUploadCount = countRow?.c ?? 0
    if (userUploadCount === 0) downloadPoints++
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

  if (promptText) {
    const lower = promptText.toLowerCase()
    if (banned.test(lower)) {
      return jsonResponse({ success: false, error: 'This content is not allowed. Please rephrase it.' }, { status: 400 })
    }
    if (maliciousHtml.test(lower)) {
      return jsonResponse({ success: false, error: 'Text contains potentially harmful code' }, { status: 400 })
    }
  }

    try {
      await withTimeout(env.yumekai_r2.put(key, file), 2000)
    } catch (err) {
      console.error('R2 put failed', err)
      return jsonResponse({ success: false, error: 'Failed to load file' }, { status: 500 })
    }

    const url = `/api/files/${id}` // local proxy link, protected!

    const creditValue = calculateUploadCredits({
      type: type as 'image' | 'music' | 'prompt',
      title: finalTitle,
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
    ).bind(targetUserId, finalTitle, type).first<string>()

    if (exists) {
      return jsonResponse({ success: false, error: 'Duplicate upload' }, { status: 400 })
    }

    await env.DB.prepare(
      'INSERT INTO uploads (id, user_id, title, type, mime, url, r2_key, credit_value, download_points, album_id, moderation_status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)'
    ).bind(
      id,
      targetUserId,
      finalTitle,
      type,
      mime,
      url,
      key,
      creditValue,
      downloadPoints,
      albumId ?? null,
      'pending'
    ).run()

    if (env.AUTO_APPROVE_UPLOADS === '1') {
      await env.DB.prepare(
        'UPDATE uploads SET approved = 1, moderation_status = ?1 WHERE id = ?2'
      ).bind('approved', id).run()
    }

    if (albumId) {
      await env.DB.prepare(
        'UPDATE albums SET cover_file_id = COALESCE(cover_file_id, ?1) WHERE id = ?2'
      ).bind(id, albumId).run()
    }

    await env.DB.prepare(
      'UPDATE user SET usedStorageMb = COALESCE(usedStorageMb,0) + ?1 WHERE id = ?2'
    ).bind(fileSizeMb, targetUserId).run()
    await updateAllSessionsOfUser(targetUserId)

    await updateUserCredits(targetUserId, creditValue)
    await logTransaction({
      userId: targetUserId,
      amount: creditValue,
      description: `Upload reward (${type})`,
      type: CREDIT_TRANSACTION_TYPE.UPLOAD_REWARD,
    })

    const creditsRow = await env.DB.prepare('SELECT currentCredits FROM user WHERE id = ?1')
      .bind(targetUserId)
      .first<{ currentCredits: number }>()

    await WebhookService.dispatch(targetUserId, 'upload_created', { upload_id: id })

    const followerRows = await env.DB.prepare(
      'SELECT follower_id FROM user_follows WHERE followee_id = ?1'
    ).bind(targetUserId).all<{ follower_id: string }>()
    for (const row of followerRows.results || []) {
      await env.DB.prepare(
        'INSERT INTO notifications (id, user_id, message) VALUES (?1, ?2, ?3)'
      ).bind(
        `not_${createId()}`,
        row.follower_id,
        `${freshUser.nickname || freshUser.email} uploaded a new file`
      ).run()
    }

    if (env.AUTO_APPROVE_UPLOADS !== '1' && type === 'image') {
      try {
        const { html, text } = renderModerationEmail({ title: finalTitle })
        await sendEmail({
          to: 'csiberius@gmail.com',
          subject: 'New image pending moderation',
          html,
          text,
        })
      } catch (err) {
        console.error('Failed to send moderation email', err)
      }
    }

    if (userUploadCount === 0) {
      const sendAfter = new Date(Date.now() + 60 * 60 * 1000)
      await env.DB.prepare(
        'INSERT INTO first_post_email (id, user_id, post_id, send_after) VALUES (?1, ?2, ?3, ?4)'
      ).bind(`fpe_${createId()}`, targetUserId, id, sendAfter.toISOString()).run()
    }

    return jsonResponse({
      success: true,
      uploadId: id,
      album_id: albumId ?? undefined,
      url,
      status: env.AUTO_APPROVE_UPLOADS === '1' ? 'approved' : 'pending',
      message: 'Upload successful!',
      download_points: downloadPoints,
      awarded_credits: creditValue,
      total_credits: creditsRow?.currentCredits ?? null,
    })
  } catch (err) {
    console.error('Error handling /api/upload:', err)
    return jsonResponse({ success: false, error: 'Server error' }, { status: 500 })
  }
}
