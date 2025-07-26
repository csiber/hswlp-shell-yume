import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server"
import { SITE_URL } from "@/constants"
import { withTimeout } from "@/utils/with-timeout"
import { getSessionFromCookie } from "@/utils/auth"
import { getSignedUrl } from "@/utils/r2"
import { ROLES_ENUM } from "@/db/schema"

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
  const isAdmin = session?.user?.role === ROLES_ENUM.ADMIN

  if ((!isOwner && !isAdmin && (upload.approved !== 1 || upload.visibility !== 'public')) || !upload.r2_key) {
    console.warn('File not public or missing key', id)
    return new Response('Fájl nem található', { status: 404 })
  }

  let isAuthorized = isOwner || isAdmin
  if (session?.user?.id && !isAuthorized) {
    const viewed = await env.DB.prepare(
      'SELECT id FROM uploads_viewed WHERE upload_id = ?1 AND user_id = ?2 LIMIT 1'
    ).bind(id, session.user.id).first<{ id: number }>()
    isAuthorized = !!viewed
  }

  let body: ReadableStream<Uint8Array> | null = null
  let contentType = upload.mime || 'application/octet-stream'

  if (isAuthorized) {
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

    body = object.body
    contentType = object.httpMetadata?.contentType || contentType
  } else {
    let url: string | null = null
    const publicBase = process.env.R2_PUBLIC_BASE_URL
    if (publicBase) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      url = `${base}${upload.r2_key}`
    } else if (typeof (env.yumekai_r2 as { createSignedUrl?: unknown }).createSignedUrl === 'function') {
      url = await getSignedUrl(env.yumekai_r2, upload.r2_key)
    }

    if (url && upload.mime?.startsWith('image/')) {
      const overlayUrl = `${SITE_URL.replace(/\/$/, '')}/favicon.svg`
      const transformed = await fetch(url, {
        cf: {
          image: {
            draw: [{ url: overlayUrl, opacity: 0.5, bottom: 10, right: 10 }],
          },
        },
      })
      if (transformed.ok && transformed.body) {
        body = transformed.body
        contentType = transformed.headers.get('Content-Type') || contentType
      }
    }

    if (!body) {
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
      body = object.body
      contentType = object.httpMetadata?.contentType || contentType
    }
  }

  try {
    await env.DB.prepare('UPDATE uploads SET view_count = COALESCE(view_count,0) + 1 WHERE id = ?1')
      .bind(id)
      .run()
  } catch (err) {
    console.error('Failed to update view count', err)
  }

  const allowedOrigin = new URL(SITE_URL).origin

  return new Response(body, {
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

