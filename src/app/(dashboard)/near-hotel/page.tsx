import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Near hotel'
}

export default async function Page() {
  const session = await getSessionFromCookie()
  if (!session) {
    return redirect('/')
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Near hotel</h1>
      <p>Kezdetleges tartalom...</p>
    </div>
  )
}
