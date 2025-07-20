import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { getDb } from '@/lib/getDb'

export interface CommunityPreview {
  id: string
  title: string
  image_url: string
  created_at: string
  author: string
  points?: number
}

export interface AlbumPreview {
  id: string
  name: string
  images: string[]
  created_at: string
  author: string
}

export async function GET() {
  const { env } = getCloudflareContext()
  const dbUploads = getDb(env, 'uploads')
  const dbAlbums = getDb(env, 'albums')
  const dbUsers = env.DB_GLOBAL
  const result = await dbUploads.prepare(`
    SELECT u.id, u.title, u.url, u.r2_key, u.created_at, u.download_points,
           u.user_id,
           COUNT(f.id) AS favorites
    FROM uploads u
    LEFT JOIN favorites f ON u.id = f.upload_id
    WHERE u.type = 'image'
      AND u.title IS NOT NULL
      AND u.visibility = 'public'
      AND u.approved = 1
      AND u.created_at >= datetime('now', '-30 day')
    GROUP BY u.id
    ORDER BY favorites DESC, u.created_at DESC
    LIMIT 5
  `).all<Record<string, string>>()

  const albumRows = await dbAlbums.prepare(`
    SELECT a.id as album_id, a.user_id, a.name as album_name, a.created_at as album_created,
           up.r2_key
    FROM albums a
    JOIN uploads up ON up.album_id = a.id
    WHERE up.approved = 1 AND up.visibility = 'public' AND up.type = 'image'
    ORDER BY a.created_at DESC
  `).all<Record<string, string>>()

  const uploadUserIds = Array.from(new Set((result.results || []).map(r => r.user_id)))
  const albumUserIds = Array.from(new Set((albumRows.results || []).map(r => r.user_id)))
  const userIds = Array.from(new Set([...uploadUserIds, ...albumUserIds]))
  const userMap: Record<string, { nickname: string | null; email: string }> = {}
  for (const id of userIds) {
    const u = await dbUsers
      .prepare('SELECT nickname, email FROM user WHERE id = ?1')
      .bind(id)
      .first<{ nickname: string | null; email: string }>()
    if (u) userMap[id] = { nickname: u.nickname ?? null, email: u.email }
  }

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items: CommunityPreview[] = []
  const albums: AlbumPreview[] = []

  for (const row of result.results || []) {
    let fileUrl: string
    if (publicBase && row.r2_key) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (row.r2_key && typeof (env.hswlp_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }

    const u = userMap[row.user_id] || { nickname: null, email: '' }
    const name = u.nickname || u.email

    items.push({
      id: row.id,
      title: row.title,
      image_url: fileUrl,
      created_at: new Date(row.created_at).toISOString(),
      author: name,
      points: row.download_points ? Number(row.download_points) : undefined,
    })
  }

  const albumMap: Record<string, AlbumPreview> = {}
  for (const row of albumRows.results || []) {
    let fileUrl: string
    if (publicBase && row.r2_key) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (row.r2_key && typeof (env.hswlp_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
    } else {
      fileUrl = row.r2_key
    }

    const u = userMap[row.user_id] || { nickname: null, email: '' }
    const name = u.nickname || u.email
    const existing = albumMap[row.album_id]
    if (existing) {
      existing.images.push(fileUrl)
    } else {
      albumMap[row.album_id] = {
        id: row.album_id,
        name: row.album_name,
        images: [fileUrl],
        created_at: new Date(row.album_created).toISOString(),
        author: name,
      }
    }
  }
  for (const a of Object.values(albumMap)) albums.push(a)

  return jsonResponse({ items, albums })
}
