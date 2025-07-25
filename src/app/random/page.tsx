import type { Metadata } from 'next'
import RandomClient from '@/components/explore/RandomClient'

export const metadata: Metadata = {
  title: 'Random AI Girls – Yumekai',
  description: 'Véletlenszerűen kiválasztott nyilvános posztok.',
  keywords: ['random', 'ai girls'],
  openGraph: { images: ['https://yumekai.com/og-cover.png'] },
}

export default function RandomPage() {
  return <RandomClient />
}
