import { PageHeader } from "@/components/page-header"
import type { DashboardItem } from "@/components/dashboard/RecentUploadsBox"
import { RecentUploadsBox } from "@/components/dashboard/RecentUploadsBox"
import { TrendingBox } from "@/components/dashboard/TrendingBox"
import { FavoritesBox } from "@/components/dashboard/FavoritesBox"
import { CommunityFeedBox } from "@/components/dashboard/CommunityFeedBox"

export default function Page() {
  const recentUploads: DashboardItem[] = [
    { id: "1", type: "image", title: "Kép #1" },
    { id: "2", type: "music", title: "Zene #2" },
    { id: "3", type: "prompt", title: "Prompt #3" },
  ]

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

  const communityFeed: DashboardItem[] = [
    { id: "1", type: "image", title: "Feed #1" },
    { id: "2", type: "music", title: "Feed #2" },
    { id: "3", type: "prompt", title: "Feed #3" },
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
          <RecentUploadsBox items={recentUploads} />
          <TrendingBox items={trendingItems} />
          <FavoritesBox items={favorites} />
        </div>
        <CommunityFeedBox items={communityFeed} />
      </div>
    </>
  )
}
