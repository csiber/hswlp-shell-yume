import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequest: PagesFunction = async (ctx) => {
  const { request } = ctx
  if (request.method !== 'GET') {
    return ctx.next()
  }

  const url = new URL(request.url)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) {
    return ctx.next()
  }

  const cache = caches.default
  const cacheKey = new Request(request.url, request as RequestInit)
  let response = await cache.match(cacheKey)
  if (response) {
    return response
  }

  response = await ctx.next()

  if (!response.headers.has('Cache-Control') && !response.headers.has('Set-Cookie')) {
    response.headers.append('Cache-Control', 'max-age=300')
    ctx.waitUntil(cache.put(cacheKey, response.clone()))
  }

  return response
}
