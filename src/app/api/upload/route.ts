import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/getDb'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie, getUserFromDB } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { WebhookService } from '@/app/services/WebhookService'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { deriveSourceApp } from '@/utils/source-app'
import { updateAllSessionsOfUser } from '@/utils/kv-session'
import { CREDIT_TRANSACTION_TYPE } from '@/db/schema'
import { calculateUploadCredits } from '@/utils/upload-credits'
import { parseBuffer } from 'music-metadata-browser'
import { formatTitle } from '@/utils/music'

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
  let session: Awaited<ReturnType<typeof getSessionFromCookie>> | null = null
  try {
    session = await getSessionFromCookie()
    const sourceApp = deriveSourceApp(req.headers.get('host') ?? undefined)

  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.uploadBanUntil && new Date(session.user.uploadBanUntil) > new Date()) {
    return jsonResponse({ success: false, error: 'Feltöltés ideiglenesen letiltva' }, { status: 403 })
  }

  const freshUser = await getUserFromDB(session.user.id)

  const formData = await req.formData()
  const file = formData.get('file')
  const title = formData.get('title')
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

  const { env } = getCloudflareContext()
  const dbUploads = getDb(env, 'uploads')
  const dbAlbums = getDb(env, 'albums')
  // uses DB_GLOBAL
  const dbUser = getDb(env, 'DB_GLOBAL')

  const fileSizeMb = Number(file.size) / (1024 * 1024)
  const usedStorageMb = Number(
    freshUser?.usedStorageMb ?? session.user.usedStorageMb ?? 0,
  )
  const uploadLimitMb = Number(
    freshUser?.uploadLimitMb ?? session.user.uploadLimitMb ?? 0,
  )

  if (!Number.isFinite(fileSizeMb)) {
    return jsonResponse(
      { success: false, error: 'Invalid file size' },
      { status: 400 },
    )
  }
  if (!Number.isFinite(usedStorageMb) || !Number.isFinite(uploadLimitMb)) {
    return jsonResponse(
      { success: false, error: 'Invalid storage info' },
      { status: 400 },
    )
  }
  if (usedStorageMb + fileSizeMb > uploadLimitMb) {
    return jsonResponse(
      {
        success: false,
        error: 'Tárhelykeret túllépve. Vásárolj bővítést a Marketplace-en.',
      },
      { status: 400 },
    )
  }

  let meta: Awaited<ReturnType<typeof parseBuffer>> | null = null
  let arrayBuffer: ArrayBuffer | null = null
  if (type === 'music') {
    try {
      arrayBuffer = await file.arrayBuffer()
      meta = await parseBuffer(Buffer.from(arrayBuffer), mime)
    } catch (err) {
      console.warn('Failed to parse music metadata', err)
    }
  }

  let finalTitle = title
  if (type === 'music' && meta) {
    const common = meta.common || {}
    const t = common.title ? formatTitle(common.title) : formatTitle(title)
    finalTitle = common.artist ? `${common.artist} - ${t}` : t
  }
  if (type === 'music' && !meta) {
    finalTitle = formatTitle(title)
  }

  if (type === 'image' && !title.trim()) {
    return jsonResponse({ success: false, error: 'Title required' }, { status: 400 })
  }

    if (type === 'image' && await isNsfwImage(file, env)) {
      return jsonResponse({ success: false, error: 'NSFW content detected' }, { status: 400 })
    }

  if (albumId) {
    const countRow = await dbUploads.prepare('SELECT COUNT(*) as c FROM uploads WHERE album_id = ?1')
      .bind(albumId)
      .first<{ c: number }>()
    if ((countRow?.c ?? 0) >= 10) {
      return jsonResponse({ success: false, error: 'Album limit reached' }, { status: 400 })
    }
    const existsAlbum = await dbAlbums.prepare('SELECT id FROM albums WHERE id = ?1 LIMIT 1')
      .bind(albumId)
      .first<{ id: string }>()
    if (!existsAlbum) {
      if (!albumName) {
        return jsonResponse({ success: false, error: 'Album name required' }, { status: 400 })
      }
      await dbAlbums.prepare(
        'INSERT INTO albums (id, name, user_id) VALUES (?1, ?2, ?3)'
      ).bind(albumId, albumName, session.user.id).run()
    }
  }

  const ext = extFromMime(mime)
  const id = uuidv4()
  const key = `uploads/${session.user.id}/${id}.${ext}`

  // Calculate download points based on metadata
  let downloadPoints = 2
  try {
    if (type === 'music' && meta) {
      const common = meta.common || {}
      if (common.title || common.artist || common.album) downloadPoints++
      if (common.picture && common.picture.length > 0) downloadPoints++
      if (meta.format?.duration && meta.format.duration > 120 && mime === 'audio/mpeg') {
        downloadPoints++
      }
    }
    const countRow = await dbUploads.prepare('SELECT COUNT(*) as c FROM uploads WHERE user_id = ?1')
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

    await env.yumekai_r2.put(key, file)

    const url = `/api/files/${id}` // helyi proxy link, védett!

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

    const exists = await dbUploads.prepare(
      'SELECT id FROM uploads WHERE user_id = ?1 AND title = ?2 AND type = ?3 LIMIT 1'
    ).bind(session.user.id, finalTitle, type).first<string>()

    if (exists) {
      return jsonResponse({ success: false, error: 'Duplicate upload' }, { status: 400 })
    }

    await dbUploads.prepare(
      'INSERT INTO uploads (id, user_id, title, type, mime, url, r2_key, credit_value, download_points, album_id, moderation_status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)'
    ).bind(id, session.user.id, finalTitle, type, mime, url, key, creditValue, downloadPoints, albumId ?? null, 'pending').run()

    if (freshUser) {
      const updateResult = await dbUser
        .prepare(
          'UPDATE user SET usedStorageMb = COALESCE(usedStorageMb,0) + ?1 WHERE id = ?2'
        )
        .bind(fileSizeMb, session.user.id)
        .run()
      if (updateResult.meta.changes === 0) {
        console.error('Storage quota not updated', {
          userId: session.user.id,
          fileSizeMb,
        })
      }
    } else {
      console.error('User not found in DB_GLOBAL', {
        userId: session.user.id,
      })
    }
    await updateAllSessionsOfUser(session.user.id)

    await updateUserCredits(session.user.id, creditValue)
    await logTransaction({
      userId: session.user.id,
      amount: creditValue,
      description: `Upload reward (${type})`,
      type: CREDIT_TRANSACTION_TYPE.UPLOAD_REWARD,
      sourceApp,
      source: 'yumekai',
    })

    const creditsRow = await dbUser.prepare('SELECT currentCredits FROM user WHERE id = ?1')
      .bind(session.user.id)
      .first<{ currentCredits: number }>()
    try {
      await WebhookService.dispatch(session.user.id, 'upload_created', { upload_id: id })
    } catch (webhookErr) {
      console.error('Webhook dispatch failed', {
        userId: session.user.id,
        error: webhookErr,
        stack: webhookErr instanceof Error ? webhookErr.stack : undefined,
      })
    }

    return jsonResponse(
      {
        success: true,
        uploadId: id,
        album_id: albumId ?? undefined,
        url,
        message: 'Feltöltés sikeres!',
        download_points: downloadPoints,
        awarded_credits: creditValue,
        total_credits: Number(creditsRow?.currentCredits || 0),
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('Error handling /api/upload', {
      userId: session?.user?.id,
      error: err,
      stack: err instanceof Error ? err.stack : undefined,
    })
    return jsonResponse({ success: false, error: 'Server error' }, { status: 500 })
  }
}
