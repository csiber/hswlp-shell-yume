import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

interface RouteContext<T> { params: Promise<T> }

export async function POST(_req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const { id } = await params
  const { env } = getCloudflareContext()
  await env.DB.prepare('UPDATE uploads SET play_count = COALESCE(play_count,0) + 1 WHERE id = ?1')
    .bind(id)
    .run()
  const row = await env.DB.prepare('SELECT play_count FROM uploads WHERE id = ?1')
    .bind(id)
    .first<{ play_count: number }>()
  return jsonResponse({ success: true, play_count: row?.play_count ?? 0 })
}
