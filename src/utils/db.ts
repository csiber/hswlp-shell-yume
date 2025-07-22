export function getDb(env: Cloudflare.Env, binding: keyof Cloudflare.Env = 'DB'): D1Database {
  return (env as unknown as Record<string, D1Database>)[binding];
}
