import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return jsonResponse({ items: [] }, { status: 401 })
  }

  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(`
    SELECT id, title, type, created_at, url, r2_key
    FROM uploads
    WHERE user_id = ?1
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(session.user.id).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items = [] as {
    id: string
    title: string
    type: 'image' | 'music' | 'prompt'
    url: string
    created_at: string
    user: { name: string | null; email: string }
  }[]

  for (const row of result.results || []) {
    let fileUrl: string
    if (publicBase) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (typeof (env.hswlp_r2 as any).createSignedUrl === 'function') {
      fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }

    const nameParts = [session.user.firstName, session.user.lastName].filter(Boolean)
    items.push({
      id: row.id,
      title: row.title,
      type: row.type as 'image' | 'music' | 'prompt',
      url: fileUrl,
      created_at: new Date(row.created_at).toISOString(),
      user: {
        name: nameParts.length ? nameParts.join(' ') : session.user.email,
        email: session.user.email!,
      },
    })
  }

  return jsonResponse({ items })
}
