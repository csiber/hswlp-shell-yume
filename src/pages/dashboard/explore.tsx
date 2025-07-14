import type { GetServerSideProps } from 'next'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSignedUrl } from '@/utils/r2'
import ExploreFilters from '@/components/explore/ExploreFilters'
import UploadGrid, { type UploadItem } from '@/components/explore/UploadGrid'
import Head from 'next/head'

interface ExplorePageProps {
  items: UploadItem[]
  currentType?: string
}

export const runtime = 'experimental-edge'

export const getServerSideProps: GetServerSideProps<ExplorePageProps> = async (
  context,
) => {
  const { env } = getCloudflareContext()
  const type = context.query.type as string | undefined
  const allowed = ['image', 'music', 'prompt']
  const filter = allowed.includes(type || '') ? type : undefined

  const cf = (context.req as unknown as { cf?: { user?: { id?: string } } }).cf
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

  return {
    props: {
      items,
      currentType: filter,
    },
  }
}

export default function ExplorePage({ items, currentType }: ExplorePageProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Head>
        <title>Felfedezés</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">Felfedezés</h1>
      <ExploreFilters currentType={currentType} />
      <UploadGrid items={items} />
    </div>
  )
}
