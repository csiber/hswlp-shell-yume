import { SESSION_COOKIE_NAME } from '@/constants'

export const onRequest = async (ctx: any) => {
  const { request, env } = ctx
  const start = performance.now()

  let response: Response

  if (request.method !== 'GET') {
    response = await ctx.next()
  } else {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) {
      response = await ctx.next()
    } else {
      const cache = caches.default
      const cacheKey = new Request(request.url, request as RequestInit)
      const cached = await cache.match(cacheKey)
      if (cached) {
        response = cached
      } else {
        response = await ctx.next()
        if (!response.headers.has('Cache-Control') && !response.headers.has('Set-Cookie')) {
          response.headers.append('Cache-Control', 'max-age=300')
          ctx.waitUntil(cache.put(cacheKey, response.clone()))
        }
      }
    }
  }

  const duration = performance.now() - start
  if (duration > 100) {
    ctx.waitUntil(logSlowRequest(env, request, duration))
  }

  return response
}

function getCookie(req: Request, name: string): string | undefined {
  const cookie = req.headers.get('cookie')
  if (!cookie) return undefined
  const cookies = cookie.split(';').map((v) => v.trim())
  for (const c of cookies) {
    const [n, ...val] = c.split('=')
    if (n === name) return decodeURIComponent(val.join('='))
  }
}

async function logSlowRequest(env: any, request: Request, duration: number) {
  let userId: string | null = null
  let sessionHash: string | null = null

  const sessionCookie = getCookie(request, SESSION_COOKIE_NAME)
  if (sessionCookie) {
    const [uid, token] = sessionCookie.split(':')
    if (uid && token) {
      userId = uid
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
      sessionHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    }
  }

  try {
    await env.DB.prepare(
      'INSERT INTO slow_request_logs (id, url, duration_ms, user_id, session_hash) VALUES (?1, ?2, ?3, ?4, ?5)'
    )
      .bind(`slog_${crypto.randomUUID()}`, request.url, Math.round(duration), userId, sessionHash)
      .run()
  } catch (err) {
    console.error('Failed to log slow request', err)
  }
}
