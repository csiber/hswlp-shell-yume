export interface SignedUrlOptions {
  expiresIn?: number
}

export async function getSignedUrl(bucket: R2Bucket, key: string, options: SignedUrlOptions = {}): Promise<string> {
  const expiresIn = options.expiresIn ?? 3600 // default 1 hour
  // Cloudflare R2 createSignedUrl API
  // TypeScript may not recognize this method in older type definitions
  // @ts-expect-error -- Cloudflare Workers provides createSignedUrl at runtime
  const url = await bucket.createSignedUrl({
    method: 'GET',
    key,
    expiresIn,
  })
  return typeof url === 'string' ? url : url?.toString()
}
