export function getDb(env: CloudflareEnv, binding: keyof Cloudflare.Env = 'DB'): D1Database {
  return (env as unknown as Record<string, D1Database>)[binding];
}
