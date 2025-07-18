import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

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
  const result = await env.DB.prepare(`
    SELECT u.id, u.title, u.url, u.r2_key, u.created_at, u.download_points,
           usr.firstName, usr.lastName, usr.email,
           COUNT(f.id) AS favorites
    FROM uploads u
    JOIN user usr ON u.user_id = usr.id
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

  const albumRows = await env.DB.prepare(`
    SELECT a.id as album_id, a.name as album_name, a.created_at as album_created,
           usr.firstName, usr.lastName, usr.email,
           up.r2_key
    FROM albums a
    JOIN uploads up ON up.album_id = a.id
    JOIN user usr ON a.user_id = usr.id
    WHERE up.approved = 1 AND up.visibility = 'public' AND up.type = 'image'
    ORDER BY a.created_at DESC
  `).all<Record<string, string>>()

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

    const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email

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

    const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email
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
