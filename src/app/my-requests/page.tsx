import type { Metadata } from 'next'
import MyRequestsClient from './requests-client'

export const metadata: Metadata = {
  title: 'Saját kéréseim – Yumekai',
  description: 'Általad leadott kérések kezelése.',
}

export default function Page() {
  return <MyRequestsClient />
}
