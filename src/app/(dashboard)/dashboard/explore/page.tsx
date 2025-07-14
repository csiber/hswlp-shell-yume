import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSignedUrl } from '@/utils/r2'
import ExploreFilters from '@/components/explore/ExploreFilters'
import UploadGrid, { type UploadItem } from '@/components/explore/UploadGrid'

export const metadata: Metadata = {
  title: 'Felfedezés',
}

interface ExplorePageProps {
  searchParams?: { type?: string }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await getSessionFromCookie()
  if (!session) {
    redirect('/')
  }

  const { env, cf } = getCloudflareContext()
  const type = searchParams?.type
  const allowed = ['image', 'music', 'prompt']
  const filter = allowed.includes(type || '') ? type : undefined

  const userId = cf?.user?.id as string | undefined

  let query =
    'SELECT u.id, u.title, u.type, u.url, u.r2_key, u.created_at'
  if (userId) {
    query += ', CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited'
  }
  query += ' FROM uploads u'
  if (userId) {
    query += ' LEFT JOIN favorites f ON f.upload_id = u.id AND f.user_id = ?1'
  }
  if (filter) {
    query += userId ? ' WHERE u.type = ?2' : ' WHERE u.type = ?1'
  }
  query += ' ORDER BY u.created_at DESC LIMIT 30'

  let stmt
  if (userId && filter) stmt = env.DB.prepare(query).bind(userId, filter)
  else if (userId) stmt = env.DB.prepare(query).bind(userId)
  else if (filter) stmt = env.DB.prepare(query).bind(filter)
  else stmt = env.DB.prepare(query)

  const result = await stmt.all<Record<string, string>>()

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const items: UploadItem[] = []

  for (const row of result.results || []) {
    let fileUrl = row.url
    if (row.r2_key) {
      if (publicBase) {
        const base = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
        fileUrl = `${base}${row.r2_key}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if (typeof (env.hswlp_r2 as any).createSignedUrl === 'function') {
        fileUrl = await getSignedUrl(env.hswlp_r2, row.r2_key)
      }
    }
    items.push({
      id: row.id,
      type: row.type as UploadItem['type'],
      url: fileUrl,
      title: row.title,
      is_favorited: row.is_favorited === 1,
    })
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Felfedezés</h1>
      <ExploreFilters currentType={filter ?? null} />
      <UploadGrid items={items} />
    </div>
  )
}
