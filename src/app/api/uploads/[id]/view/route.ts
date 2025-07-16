import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

interface RouteContext<T> { params: Promise<T> }

export async function POST(_req: NextRequest, { params }: RouteContext<{ id: string }>) {
  const { id } = await params
  const { env } = getCloudflareContext()
  await env.DB.prepare('UPDATE uploads SET view_count = COALESCE(view_count,0) + 1 WHERE id = ?1')
    .bind(id)
    .run()
  const row = await env.DB.prepare('SELECT view_count FROM uploads WHERE id = ?1')
    .bind(id)
    .first<{ view_count: number }>()
  return jsonResponse({ success: true, view_count: row?.view_count ?? 0 })
}
