import type { Metadata } from 'next'
import ExploreClient from '@/components/explore/ExploreClient'

export const metadata: Metadata = {
  title: 'Trending AI Girls – Yumekai',
  description: 'Legnépszerűbb AI posztok az elmúlt 7 napban.',
  keywords: ['trending', 'ai girls'],
  openGraph: { images: ['https://yumekai.com/og-cover.png'] },
}

export default function TrendingPage() {
  return <ExploreClient endpoint="/api/trending" />
}
