import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server"
import { SITE_URL } from "@/constants"
import { withTimeout } from "@/utils/with-timeout"
import { getSessionFromCookie } from "@/utils/auth"

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  const { env } = getCloudflareContext()

  const id = req.nextUrl.pathname.split('/').pop()!

  let upload: {
    r2_key: string | null
    mime: string | null
    approved: number
    visibility: string
    user_id: string
  } | null

  try {
    upload = await env.DB.prepare(
      `SELECT r2_key, mime, approved, visibility, user_id
         FROM uploads
        WHERE id = ?1
        LIMIT 1`
    )
      .bind(id)
      .first()
  } catch (err) {
    console.error('DB query failed', err)
    return new Response('Internal Server Error', { status: 500 })
  }

  if (!upload) {
    console.warn('File not found in DB', id)
    return new Response('Fájl nem található', { status: 404 })
  }

  const isOwner = session?.user?.id === upload.user_id

  if ((!isOwner && (upload.approved !== 1 || upload.visibility !== 'public')) || !upload.r2_key) {
    console.warn('File not public or missing key', id)
    return new Response('Fájl nem található', { status: 404 })
  }

  let object: R2ObjectBody | string | null
  try {
    object = await withTimeout(env.yumekai_r2.get(upload.r2_key), 2000)
  } catch (err) {
    console.error('R2 get failed', err)
    object = null
  }

  if (!object || typeof object === 'string' || !object.body) {
    console.warn('File not found in R2', upload.r2_key)
    return new Response('Fájl nem található', { status: 404 })
  }

  try {
    await env.DB.prepare('UPDATE uploads SET view_count = COALESCE(view_count,0) + 1 WHERE id = ?1')
      .bind(id)
      .run()
  } catch (err) {
    console.error('Failed to update view count', err)
  }

  const allowedOrigin = new URL(SITE_URL).origin
  const contentType = object.httpMetadata?.contentType || upload.mime || 'application/octet-stream'

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

