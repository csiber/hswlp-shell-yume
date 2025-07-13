import "server-only"

import CommunityFeed from "@/components/community/CommunityFeedV3"

export default function FeedCenter() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <CommunityFeed />
    </div>
  )
}
