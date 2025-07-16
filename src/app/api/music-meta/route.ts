import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { parseBuffer } from 'music-metadata-browser'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return jsonResponse({ error: 'Missing id' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const row = await env.DB.prepare(
    'SELECT r2_key FROM uploads WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{ r2_key: string }>()

  if (!row?.r2_key) {
    return new Response('Not found', { status: 404 })
  }

  const object = await env.hswlp_r2.get(row.r2_key)
  if (!object?.body) {
    return new Response('File not found', { status: 404 })
  }

  try {
    const buffer = await object.arrayBuffer()
    const meta = await parseBuffer(Buffer.from(buffer), object.httpMetadata?.contentType || 'audio/mpeg')
    const common = meta.common || {}
    let picture: string | null = null
    if (common.picture && common.picture[0]) {
      const pic = common.picture[0]
      const mime = pic.format || 'image/jpeg'
      picture = `data:${mime};base64,${Buffer.from(pic.data).toString('base64')}`
    }
    return jsonResponse({
      title: common.title ?? null,
      artist: common.artist ?? null,
      album: common.album ?? null,
      picture,
    })
  } catch (err) {
    console.error(err)
    return jsonResponse({ error: 'Metadata parse failed' }, { status: 500 })
  }
}
