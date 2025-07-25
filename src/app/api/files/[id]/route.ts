import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server"
import { SITE_URL } from "@/constants"
import { withTimeout } from "@/utils/with-timeout"

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext()

  const id = req.nextUrl.pathname.split("/").pop()!
  const upload = await env.DB.prepare(
    `SELECT r2_key, mime, approved, visibility
       FROM uploads
      WHERE id = ?1
      LIMIT 1`
  )
    .bind(id)
    .first<{ r2_key: string; mime: string | null; approved: number; visibility: string }>()

  if (!upload || upload.approved !== 1 || upload.visibility !== 'public') {
    return new Response('Not found', { status: 404 })
  }

  const object: R2ObjectBody | string | null = await (async () => {
    try {
      return await withTimeout(env.yumekai_r2.get(upload.r2_key), 2000)
    } catch (err) {
      console.error('R2 get failed', err)
      return 'Hiba történt a fájl betöltésénél'
    }
  })()

  await env.DB.prepare(
    'UPDATE uploads SET view_count = COALESCE(view_count,0) + 1 WHERE id = ?1'
  )
    .bind(id)
    .run()
  if (!object || typeof object === 'string' || !object.body) {
    return new Response('File not found', { status: 404 })
  }

  const allowedOrigin = new URL(SITE_URL).origin
  const contentType =
    object.httpMetadata?.contentType || upload.mime || 'application/octet-stream'

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Accept-Ranges': 'bytes', // <--- ez fontos a seek és stream működéséhez
      'Cache-Control': 'public, max-age=86400',
    },
  })
  }

