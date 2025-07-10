import { Metadata } from 'next'
import { SITE_NAME, SITE_DESCRIPTION } from '@/constants'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import HomeSidebar from '@/components/home/HomeSidebar'
import RightSidebar from '@/components/home/RightSidebar'
import HomeNavbar from '@/components/home/HomeNavbar'
import { FeedCard } from '@/components/home/FeedCard'
import NewPostButton from '@/components/home/NewPostButton'
import { feedPosts } from '@/data/feed'


export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
}


export default function Home() {
  return (
    <SidebarProvider>
      <HomeSidebar />
      <SidebarInset>
        <HomeNavbar />
        <div className="container mx-auto flex gap-6 p-4 pt-16">

          <div className="flex-1 max-w-[640px] space-y-4">
            {feedPosts.map((post) => (
              <FeedCard key={post.id} {...post} />
            ))}
          </div>
          <div className="hidden xl:block w-72">
            <RightSidebar />
          </div>
        </div>
        <NewPostButton />
      </SidebarInset>
    </SidebarProvider>
  )
}
