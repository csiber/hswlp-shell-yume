import type { Metadata } from 'next'
import ExploreClient from '@/components/explore/ExploreClient'

export const metadata: Metadata = {
  title: 'Explore \u2013 Yumekai AI Gallery',
  description: 'Browse high-quality AI-generated anime art from the community.',
  keywords: ['explore', 'gallery', 'public posts'],
  openGraph: {
    images: ['https://yumekai.com/og-cover.png'],
  },
}

export default function ExplorePage() {
  return <ExploreClient />
}
