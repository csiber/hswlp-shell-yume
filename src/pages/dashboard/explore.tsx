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

  let query = 'SELECT id, title, type, url, r2_key, created_at FROM uploads'
  if (filter) query += ' WHERE type = ?1'
  query += ' ORDER BY created_at DESC LIMIT 30'

  const stmt = filter
    ? env.DB.prepare(query).bind(filter)
    : env.DB.prepare(query)

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
