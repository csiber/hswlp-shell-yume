import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server"
import { SITE_URL } from "@/constants"
import { getDb } from '@/lib/getDb'

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext()
  const db = getDb(env, 'uploads')

  const id = req.nextUrl.pathname.split("/").pop()!
  const upload = await db.prepare(
    'SELECT r2_key, type FROM uploads WHERE id = ?1 LIMIT 1'
  )
    .bind(id)
    .first<{ r2_key: string; type: string }>()

  if (!upload) {
    return new Response("Not found", { status: 404 })
  }

  const object = await env.yumekai_r2.get(upload.r2_key)
  if (!object?.body) {
    return new Response("File not found", { status: 404 })
  }

  await db.prepare(
    'UPDATE uploads SET view_count = COALESCE(view_count,0) + 1 WHERE id = ?1'
  )
    .bind(id)
    .run()

  const allowedOrigin = new URL(SITE_URL).origin
  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "audio/mpeg",
      "Content-Disposition": 'inline; filename="audio.mp3"',
      "Access-Control-Allow-Origin": allowedOrigin,
      "Accept-Ranges": "bytes", // <--- ez fontos a seek és stream működéséhez
      "Cache-Control": "no-store",
    },
  })
}
