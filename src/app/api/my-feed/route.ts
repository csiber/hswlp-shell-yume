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
    SELECT u.id, u.title, u.type, u.created_at, u.url, u.r2_key,
           u.view_count, u.play_count,
           usr.firstName, usr.lastName, usr.email
    FROM uploads u
    JOIN user usr ON u.user_id = usr.id
    WHERE u.visibility = 'public' OR u.visibility IS NULL
    ORDER BY u.created_at DESC
    LIMIT 50
  `).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items = [] as {
    id: string
    title: string
    type: 'image' | 'music' | 'prompt'
    url: string
    created_at: string
    view_count: number
    play_count: number
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

    const nameParts = [row.firstName, row.lastName].filter(Boolean)
    items.push({
      id: row.id,
      title: row.title,
      type: row.type as 'image' | 'music' | 'prompt',
      url: fileUrl,
      created_at: new Date(row.created_at).toISOString(),
      view_count: Number(row.view_count ?? 0),
      play_count: Number(row.play_count ?? 0),
      user: {
        name: nameParts.length ? nameParts.join(' ') : row.email,
        email: row.email,
      },
    })
  }

  return jsonResponse({ items })
}
