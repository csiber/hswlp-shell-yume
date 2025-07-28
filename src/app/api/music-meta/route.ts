import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { parseID3 } from '@/utils/simple-id3'
import { NextRequest } from 'next/server'
import { guessMetaFromFilename } from '@/utils/music'
import { withTimeout } from '@/utils/with-timeout'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return jsonResponse({ error: 'Missing id' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const row = await env.DB.prepare(
    'SELECT r2_key, title FROM uploads WHERE id = ?1 LIMIT 1'
  ).bind(id).first<{ r2_key: string; title: string }>()

  if (!row?.r2_key) {
    return new Response('Not found', { status: 404 })
  }

  let object: R2ObjectBody | string | null = null
  try {
    object = await withTimeout(env.yumekai_r2.get(row.r2_key), 2000)
  } catch (err) {
    console.error('R2 get failed', err)
    object = 'Failed to load file'
  }
  if (!object || typeof object === 'string' || !object.body) {
    return new Response('File not found', { status: 404 })
  }

  try {
    const buffer = await object.arrayBuffer()
    const meta = parseID3(buffer)
    let picture: string | null = null
    if (meta?.picture) {
      picture = `data:${meta.picture.mime};base64,${Buffer.from(meta.picture.data).toString('base64')}`
    }
    const fallback = guessMetaFromFilename(row.title)
    return jsonResponse({
      title: meta?.title ?? fallback.title ?? null,
      artist: meta?.artist ?? fallback.artist ?? null,
      album: meta?.album ?? null,
      picture,
    })
  } catch (err) {
    console.error(err)
    const fallback = guessMetaFromFilename(row.title)
    return jsonResponse({
      title: fallback.title,
      artist: fallback.artist,
      album: null,
      picture: null,
    })
  }
}
