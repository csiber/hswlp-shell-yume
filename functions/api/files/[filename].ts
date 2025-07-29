export const onRequestGet = async (ctx: any) => {
  const { env, request, params } = ctx;
  const key = params.filename as string;

  const cache = caches.default;
  const cacheKey = new Request(request.url, request as RequestInit);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  let object: R2ObjectBody | null = null;
  try {
    object = await env.yumekai_r2.get(key);
  } catch (err) {
    console.error('Failed to fetch R2 object', err);
  }

  if (!object || !object.body) {
    return new Response('File not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }

  const contentType =
    object.httpMetadata?.contentType || getMimeType(key);

  const headers = new Headers({
    'Content-Type': contentType
  });

  if (object.etag) headers.set('ETag', object.etag);
  if (object.uploaded)
    headers.set('Last-Modified', object.uploaded.toUTCString());

  const isImage = contentType.startsWith('image/');
  if (isImage) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  const response = new Response(object.body, {
    status: 200,
    headers
  });

  if (isImage) {
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
};

function getMimeType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
