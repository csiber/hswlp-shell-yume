export const onRequestGet = async (ctx: any) => {
  const { env, params } = ctx;
  const key = params.filename as string;

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
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable'
  });

  if (object.etag) headers.set('ETag', object.etag);
  if (object.uploaded)
    headers.set('Last-Modified', object.uploaded.toUTCString());

  return new Response(object.body, {
    status: 200,
    headers
  });
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
