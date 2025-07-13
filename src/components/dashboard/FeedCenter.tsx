"use client"

import StoryList from "./StoryList"
import CreatePostBox from "./CreatePostBox"
import FeedList from "./FeedList"

export default function FeedCenter() {
  return (
    <div className="flex-1 flex flex-col gap-4 px-4 py-6">
      <StoryList />
      <CreatePostBox />
      <FeedList />
    </div>
  )
}
