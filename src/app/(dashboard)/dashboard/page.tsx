import { PageHeader } from "@/components/page-header"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getSessionFromCookie } from "@/utils/auth"
import type { DashboardItem } from "@/components/dashboard/RecentUploadsBox"
import type { UploadItem } from "@/components/dashboard/MyUploadsBox"
import { MyUploadsBox } from "@/components/dashboard/MyUploadsBox"
import { TrendingBox } from "@/components/dashboard/TrendingBox"
import { FavoritesBox } from "@/components/dashboard/FavoritesBox"
import CommunityFeed from "@/components/community/CommunityFeedV2"

export default async function Page() {
  const session = await getSessionFromCookie()
  const uploads: UploadItem[] = []

  if (session?.user?.id) {
    const { env } = getCloudflareContext()
    const result = await env.DB.prepare(
      'SELECT id, title, type FROM uploads WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(session.user.id).all<Record<string, string>>()

    for (const row of result.results || []) {
      uploads.push({
        id: row.id,
        title: row.title,
        type: row.type as UploadItem['type'],
        url: `/api/files/${row.id}`, // Privát fájl-elérés
      })
    }
  }

  const trendingItems: DashboardItem[] = [
    { id: "1", type: "image", title: "Trend #1" },
    { id: "2", type: "music", title: "Trend #2" },
    { id: "3", type: "prompt", title: "Trend #3" },
  ]

  const favorites: DashboardItem[] = [
    { id: "1", type: "music", title: "Playlist #1" },
    { id: "2", type: "music", title: "Playlist #2" },
    { id: "3", type: "image", title: "Kedvenc #3" },
  ]

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/dashboard",
            label: "Dashboard",
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <MyUploadsBox items={uploads} />
          <TrendingBox items={trendingItems} />
          <FavoritesBox items={favorites} />
        </div>
        <CommunityFeed />
      </div>
    </>
  )
}
