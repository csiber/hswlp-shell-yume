import type { NextApiRequest, NextApiResponse } from 'next'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'

interface FeedItem {
  id: string
  title: string
  type: 'image' | 'music' | 'prompt'
  url: string
  created_at: string
  user: {
    name: string | null
    email: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }

  const { env } = getCloudflareContext()

  const result = await env.DB.prepare(`
    SELECT u.id, u.title, u.type, u.created_at, u.url, u.r2_key,
           usr.firstName, usr.lastName, usr.email
    FROM uploads u
    JOIN user usr ON u.user_id = usr.id
    ORDER BY u.created_at DESC
    LIMIT 50
  `).all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items: FeedItem[] = []

  for (const row of result.results || []) {
    const nameParts = [row.firstName, row.lastName].filter(Boolean)
    let fileUrl: string

    if (publicBase) {
      const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      fileUrl = `${base}${row.r2_key}`
    } else if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (env.hswlp_r2 as any).createSignedUrl === 'function'
    ) {
      fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
    } else {
      fileUrl = row.url
    }

    items.push({
      id: row.id,
      title: row.title,
      type: row.type as FeedItem['type'],
      url: fileUrl,
      created_at: new Date(row.created_at).toISOString(),
      user: {
        name: nameParts.length ? nameParts.join(' ') : null,
        email: row.email,
      },
    })
  }

  const response = jsonResponse({ items })
  res.status(response.status)
  for (const [key, value] of Object.entries(response.headers)) {
    res.setHeader(key, value)
  }
  res.end(await response.text())
}
