import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import GroupGrid from '@/components/groups/GroupGrid'

export const metadata: Metadata = {
  title: 'Csoportok',
}

export default async function Page() {
  const session = await getSessionFromCookie()
  if (!session) {
    return redirect('/')
  }
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(`
    SELECT g.id, g.slug, g.name, g.description, g.cover_url,
           CASE WHEN gm.id IS NULL THEN 0 ELSE 1 END as is_member
    FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?1
    WHERE g.is_public = 1
    ORDER BY g.created_at DESC
  `).bind(session.user.id).all<{
    id: string; slug: string; name: string; description: string; cover_url: string | null; is_member: number
  }>()

  const groups = rows.results || []
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Csoportok</h1>
      <GroupGrid groups={groups} />
    </div>
  )
}
