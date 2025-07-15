"use client"

import CommunityFeedV3 from "../community/CommunityFeedV3"

export default function FeedCenter() {
  return (
    <div className="flex-1 flex flex-col gap-2 sm:gap-4 px-2 md:px-4 py-6">
      <CommunityFeedV3 endpoint="/api/my-feed" />
    </div>
  )
}
