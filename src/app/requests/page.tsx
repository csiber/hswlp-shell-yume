import type { Metadata } from 'next'
import RequestsClient from './requests-client'

export const metadata: Metadata = {
  title: 'Kérések – Yumekai',
  description: 'Közösségi kérések kezelése.',
}

export default function Page() {
  return <RequestsClient />
}
