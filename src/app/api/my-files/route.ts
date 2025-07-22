// src/app/api/my-files/route.ts

import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest } from 'next/server'
import { getSignedUrl } from '@/utils/r2'

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  const { env } = getCloudflareContext()

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const allowedTypes = ['image', 'music', 'prompt']
  const filter = type && allowedTypes.includes(type) ? `AND type = '${type}'` : ''

  const result = await env.DB.prepare(`
    SELECT id, title, description, tags, note, type AS category, mime, url,
           download_points, approved, moderation_status, moderation_reason,
           view_count, download_count, play_count, locked, total_generated_points
    FROM uploads
    WHERE user_id = ?1 ${filter}
    ORDER BY rowid DESC
  `).bind(session.user.id).all<{
    id: string;
    title: string;
    description: string | null;
    tags: string | null;
    note: string | null;
    category: 'image' | 'music' | 'prompt';
    mime: string | null;
    url: string;
    download_points: number | null;
    approved: number;
    moderation_status: string | null;
    moderation_reason: string | null;
    view_count: number | null;
    download_count: number | null;
    play_count: number | null;
    locked: number | null;
    total_generated_points: number | null;
  }>()

  const albumRows = await env.DB.prepare(
    `SELECT a.id, a.name, a.created_at, a.cover_file_id, up.r2_key, COUNT(u.id) as count
       FROM albums a
       LEFT JOIN uploads up ON up.id = a.cover_file_id
       LEFT JOIN uploads u ON u.album_id = a.id
      WHERE a.user_id = ?1
      GROUP BY a.id
      ORDER BY a.created_at DESC`
  ).bind(session.user.id).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const albums: { id: string; name: string; created_at: string; cover_url: string | null; count: number }[] = []
  for (const row of albumRows.results || []) {
    let url: string | null = null
    if (row.r2_key) {
      if (publicBase) {
        const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
        url = `${base}${row.r2_key}`
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else if (typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
        url = await getSignedUrl(env.yumekai_r2, row.r2_key)
      }
    }
    albums.push({
      id: row.id,
      name: row.name,
      created_at: row.created_at,
      cover_url: url,
      count: Number(row.count || 0)
    })
  }

  return Response.json({ success: true, items: result.results, albums })
}
