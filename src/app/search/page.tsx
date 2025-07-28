import type { Metadata } from 'next'
import SearchClient from '@/components/search/SearchClient'

export const metadata: Metadata = {
  title: 'Search – Yumekai AI Gallery',
  description: 'Search community uploads by title or tag.',
  keywords: ['search', 'tags', 'uploads']
}

export default function SearchPage() {
  return <SearchClient />
}
