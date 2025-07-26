import type { Metadata } from 'next'
import MyRequestsClient from './requests-client'

export const metadata: Metadata = {
  title: 'My requests – Yumekai',
  description: 'Manage your submitted requests.',
}

export default function Page() {
  return <MyRequestsClient />
}
