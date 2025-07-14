import { Metadata } from 'next'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import BadgeGrid from '@/components/badges/BadgeGrid'
import type { BadgeItem } from '@/components/badges/BadgeCard'

export const metadata: Metadata = {
  title: 'Badges'
}

export default async function Page() {
  const session = await getSessionFromCookie()
  if (!session) {
    return redirect('/')
  }
  const { env } = getCloudflareContext()
  const rows = await env.DB.prepare(
    `SELECT b.id, b.slug, b.name, b.description, b.icon_url, b.category,
            CASE WHEN ub.id IS NULL THEN 0 ELSE 1 END AS earned
     FROM badges b
     LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = ?1
     ORDER BY b.created_at ASC`
  ).bind(session.user.id).all<Record<string, unknown>>()

  const badges = (rows.results as BadgeItem[] | null) ?? []

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">Jelvények</h1>
      <BadgeGrid badges={badges} />
    </div>
  )
}
