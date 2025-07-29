import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return jsonResponse({ error: 'Missing id' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const row = await env.DB.prepare(
    `SELECT r2_key
       FROM uploads
      WHERE id = ?1 AND approved = 1 AND visibility = 'public'
        AND (moderation_status IS NULL OR moderation_status = 'approved')
      LIMIT 1`
  ).bind(id).first<{ r2_key: string | null }>()

  if (!row?.r2_key) {
    return new Response('Not found', { status: 404 })
  }

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  let url: string
  if (publicBase) {
    const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
    url = `${base}${row.r2_key}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (typeof (env.yumekai_r2 as any).createSignedUrl === 'function') {
    url = await getSignedUrl(env.yumekai_r2, row.r2_key)
  } else {
    url = `/api/files/${id}`
  }

  return jsonResponse({ preview_url: url })
}
