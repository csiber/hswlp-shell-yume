import type { Metadata } from 'next'
import ExploreClient from '@/components/explore/ExploreClient'

export const metadata: Metadata = {
  title: 'Felfedezés - Nyilvános galéria',
  description: 'Fedezd fel a legfrissebb publikus posztokat a Yumekai galériában',
  keywords: ['explore', 'galéria', 'nyilvános posztok'],
}

export default function ExplorePage() {
  return <ExploreClient />
}
