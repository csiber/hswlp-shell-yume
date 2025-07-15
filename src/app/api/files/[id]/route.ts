import { getSessionFromCookie } from "@/utils/auth"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  const { env } = getCloudflareContext()

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const id = req.nextUrl.pathname.split("/").pop()!
  const upload = await env.DB.prepare(
    'SELECT r2_key, type FROM uploads WHERE id = ?1 AND user_id = ?2 LIMIT 1'
  )
    .bind(id, session.user.id)
    .first<{ r2_key: string; type: string }>()

  if (!upload) {
    return new Response("Not found", { status: 404 })
  }

  const object = await env.hswlp_r2.get(upload.r2_key)
  if (!object?.body) {
    return new Response("File not found", { status: 404 })
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "audio/mpeg",
      "Content-Disposition": 'inline; filename="audio.mp3"',
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes", // <--- ez fontos a seek és stream működéséhez
      "Cache-Control": "no-store",
    },
  })
}
