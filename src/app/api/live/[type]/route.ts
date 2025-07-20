import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'
import { getDb } from '@/lib/getDb'

interface RouteContext<T> {
  params: Promise<T>
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ type: string }>,
) {
  const { type } = await params
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')
  if (type !== 'music' && type !== 'image') {
    return jsonResponse({ items: [] }, { status: 400 })
  }

  const result = await db.prepare(
    'SELECT id, title, r2_key, created_at FROM uploads WHERE type = ?1 ORDER BY created_at DESC LIMIT 10'
  ).bind(type).all<Record<string, string>>()

  const baseUrl = 'https://pub.hswlp.hu/r2/'
  const items = (result.results || []).map((row) => ({
    id: row.id,
    title: row.title,
    type,
    url: `${baseUrl}${row.r2_key}`,
    created_at: new Date(row.created_at).toISOString(),
  }))

  return jsonResponse({ items })
}
