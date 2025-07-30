import { getCloudflareContext } from '@opennextjs/cloudflare'
import TopUsersList from '@/components/dashboard/TopUsersList'

export const metadata = {
  title: 'Top Users',
  description: 'Most active members',
}

export default async function TopUsersPage() {
  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(`
    SELECT
      u.id,
      u.nickname,
      SUM(CASE WHEN up.type = 'image' THEN 1 ELSE 0 END) AS image_count,
      SUM(CASE WHEN up.type = 'music' THEN 1 ELSE 0 END) AS music_count,
      SUM(CASE WHEN up.type = 'prompt' THEN 1 ELSE 0 END) AS prompt_count,
      (
        SELECT COALESCE(SUM(amount),0)
        FROM credit_transaction ct
        WHERE ct.user_id = u.id
      ) AS credits
    FROM user u
    LEFT JOIN uploads up ON up.user_id = u.id
    GROUP BY u.id
    ORDER BY (image_count + music_count + prompt_count) DESC
    LIMIT 10
  `).all<Record<string, string>>()

  const users = (result.results || []).map(row => ({
    id: row.id as string,
    nickname: (row.nickname as string) || 'Unknown',
    imageCount: Number(row.image_count ?? 0),
    musicCount: Number(row.music_count ?? 0),
    promptCount: Number(row.prompt_count ?? 0),
    credits: Number(row.credits ?? 0),
  }))

  return (
    <>
      <div className="h-4" />
      <div className="container mx-auto px-5 pb-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Top Users</h1>
        <TopUsersList users={users} />
      </div>
    </>
  )
}
