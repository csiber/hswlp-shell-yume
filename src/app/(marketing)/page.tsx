"use client"

// metadata is exported from ./page-metadata.ts
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import HomeSidebar from '@/components/home/HomeSidebar'
import RightSidebar from '@/components/home/RightSidebar'
import HomeNavbar from '@/components/home/HomeNavbar'
import PostCard from '@/components/home/PostCard'
import NewPostButton from '@/components/home/NewPostButton'
import { feedPosts } from '@/data/feed'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'




export default function Home() {
  const [tag, setTag] = useState<string | null>(null)
  const tags = Array.from(new Set(feedPosts.flatMap((p) => p.tags)))
  const posts = tag ? feedPosts.filter((p) => p.tags.includes(tag)) : feedPosts

  return (
    <SidebarProvider>
      <HomeSidebar />
      <SidebarInset>
        <HomeNavbar />
        <div className="container mx-auto flex flex-col xl:flex-row gap-6 p-4 pt-16">
          <div className="flex-1 max-w-[640px] mx-auto space-y-6 order-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge
                className="cursor-pointer"
                variant={tag ? 'outline' : 'secondary'}
                onClick={() => setTag(null)}
              >
                Összes
              </Badge>
              {tags.map((t) => (
                <Badge
                  key={t}
                  className="cursor-pointer"
                  variant={tag === t ? 'secondary' : 'outline'}
                  onClick={() => setTag(t)}
                >
                  #{t}
                </Badge>
              ))}
            </div>
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
          <div className="w-full xl:w-72 order-2 mt-6 xl:mt-0">
            <RightSidebar />
          </div>
        </div>
        <NewPostButton />
      </SidebarInset>
    </SidebarProvider>
  )
}
