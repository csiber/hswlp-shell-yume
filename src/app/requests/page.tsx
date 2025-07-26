import type { Metadata } from 'next'
import RequestsClient from './requests-client'

export const metadata: Metadata = {
  title: 'Requests – Yumekai',
  description: 'Manage community requests.',
}

export default function Page() {
  return <RequestsClient />
}
