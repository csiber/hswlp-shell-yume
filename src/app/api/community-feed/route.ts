import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { BADGE_DEFINITIONS } from '@/constants'

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
  const [result, albumRows] = await Promise.all([
    env.DB.prepare(`
      SELECT u.id, u.title, u.type, u.mime, u.url, u.r2_key, u.created_at, u.download_points,
             usr.nickname, usr.email,
             (SELECT badge_key FROM user_badges WHERE user_id = usr.id ORDER BY awarded_at LIMIT 1) as badge_key,
             COUNT(f.id) AS favorites
        FROM uploads u
        JOIN user usr ON u.user_id = usr.id
        LEFT JOIN favorites f ON u.id = f.upload_id
       WHERE u.title IS NOT NULL
         AND u.visibility = 'public'
         AND u.approved = 1
         AND (u.moderation_status IS NULL OR u.moderation_status = 'approved')
         AND u.created_at >= datetime('now', '-30 day')
       GROUP BY u.id
       ORDER BY favorites DESC, u.created_at DESC
       LIMIT 5
    `).all<Record<string, string>>(),
    env.DB.prepare(`
      SELECT a.id as album_id, a.name as album_name, a.created_at as album_created,
             usr.nickname, usr.email,
             up.r2_key
        FROM albums a
        JOIN uploads up ON up.album_id = a.id
        JOIN user usr ON a.user_id = usr.id
       WHERE up.approved = 1 AND up.visibility = 'public'
         AND (up.moderation_status IS NULL OR up.moderation_status = 'approved')
       ORDER BY a.created_at DESC
    `).all<Record<string, string>>(),
  ])

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const prefix = publicBase
    ? publicBase.endsWith('/')
      ? publicBase
      : `${publicBase}/`
    : ''

  async function resolveUrl(key: string | null, fallback: string) {
    if (key) {
      if (publicBase) {
        return `${prefix}${key}`
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
        return getSignedUrl(env.yumekai_r2, key)
      }
    }
    return fallback
  }

  const items = await Promise.all(
    (result.results || []).map(async row => ({
      id: row.id,
      title: row.title,
      mime: row.mime,
      image_url: await resolveUrl(row.r2_key, row.url),
      created_at: row.created_at,
      author: row.nickname || row.email,
      badge: row.badge_key
        ? {
            icon: BADGE_DEFINITIONS[row.badge_key as keyof typeof BADGE_DEFINITIONS].icon,
            name: BADGE_DEFINITIONS[row.badge_key as keyof typeof BADGE_DEFINITIONS].name,
            description: BADGE_DEFINITIONS[row.badge_key as keyof typeof BADGE_DEFINITIONS].description,
          }
        : undefined,
      points: row.download_points ? Number(row.download_points) : undefined,
    })),
  )

  const albumData = await Promise.all(
    (albumRows.results || []).map(async row => ({
      album_id: row.album_id,
      album_name: row.album_name,
      album_created: row.album_created,
      fileUrl: await resolveUrl(row.r2_key, row.r2_key),
      name: row.nickname || row.email,
    })),
  )

  const albumMap: Record<string, AlbumPreview> = {}
  for (const row of albumData) {
    const existing = albumMap[row.album_id]
    if (existing) {
      existing.images.push(row.fileUrl)
    } else {
      albumMap[row.album_id] = {
        id: row.album_id,
        name: row.album_name,
        images: [row.fileUrl],
        created_at: row.album_created,
        author: row.name,
      }
    }
  }
  const albums = Object.values(albumMap)

  return jsonResponse({ items, albums })
}
