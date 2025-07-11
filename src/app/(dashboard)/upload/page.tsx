import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import UploadClient from './upload.client'

export const metadata: Metadata = {
  title: 'Feltöltés'
}

export default async function UploadPage() {
  const session = await getSessionFromCookie()
  if (!session) {
    return redirect('/')
  }

  return <UploadClient />
}
