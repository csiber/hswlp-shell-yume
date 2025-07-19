// R2 buckethez tartozó aláírt URL generálása
export interface SignedUrlOptions {
  expiresIn?: number
}

export async function getSignedUrl(
  bucket: R2Bucket,
  key: string,
  options: SignedUrlOptions = {},
): Promise<string> {
  const expiresIn = options.expiresIn ?? 3600 // default 1 hour

  // createSignedUrl only exists in the actual Cloudflare Workers runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createSignedUrl = (bucket as any).createSignedUrl

  if (typeof createSignedUrl === 'function') {
    // TypeScript may not recognize this method in older type definitions
    const url = await createSignedUrl.call(bucket, {
      method: 'GET',
      key,
      expiresIn,
    })

    return typeof url === 'string' ? url : url?.toString()
  }

  // Ha nem érhető el az aláírt URL generálás, visszaadjuk a kulcsot,
  // amit egy belső fetch útvonallal lehet kezelni
  return key
}
