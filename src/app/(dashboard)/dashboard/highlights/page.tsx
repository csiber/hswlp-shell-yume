import HighlightsAdminClient from './HighlightsAdminClient'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { ROLES_ENUM } from '@/db/schema'

export default async function HighlightsPage() {
  const session = await getSessionFromCookie()

  if (!session || session.user.role !== ROLES_ENUM.ADMIN) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12 space-y-8">
      <header className="space-y-2 pt-6">
        <h1 className="text-3xl font-bold">Kiemelt kollekciók kezelése</h1>
        <p className="text-muted-foreground">
          Állíts össze tematikus gyűjteményeket a kiemelt bejegyzésekhez és tartsd karban az időablakokat.
        </p>
      </header>
      <HighlightsAdminClient />
    </div>
  )
}
