import { requireAdmin } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  await requireAdmin()
  const { env } = getCloudflareContext()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return jsonResponse({ items: [] })
  const like = `%${q}%`
  const rows = await env.DB.prepare(
    'SELECT id, nickname, email FROM user WHERE nickname LIKE ?1 OR email LIKE ?1 LIMIT 20'
  ).bind(like).all<Record<string, string>>()
  const items = (rows.results || []).map(r => ({
    id: r.id,
    name: r.nickname || r.email || r.id
  }))
  return jsonResponse({ items })
}
