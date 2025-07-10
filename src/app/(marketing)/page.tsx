import { Metadata } from 'next'
import { SITE_NAME, SITE_DESCRIPTION } from '@/constants'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import HomeSidebar from '@/components/home/HomeSidebar'
import RightSidebar from '@/components/home/RightSidebar'
import HomeNavbar from '@/components/home/HomeNavbar'
import { FeedCard } from '@/components/home/FeedCard'

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
}

const posts = [
  {
    author: 'Jane Doe',
    title: 'Új plugin ötlet',
    description: 'Fedezd fel az új XY plugint, ami megkönnyíti a munkát.',
    date: new Date().toISOString(),
    tags: ['plugin', 'közösség'],
  },
  {
    author: 'John Smith',
    title: 'Yume frissítés',
    description: 'Megérkezett a legújabb verzió rengeteg újdonsággal.',
    date: new Date(Date.now() - 3600_000).toISOString(),
    tags: ['yume', 'update'],
  },
]

export default function Home() {
  return (
    <SidebarProvider>
      <HomeSidebar />
      <SidebarInset>
        <HomeNavbar />
        <div className="container mx-auto flex gap-6 p-4 pt-16">
          <div className="flex-1 max-w-2xl space-y-4">
            {posts.map((post, idx) => (
              <FeedCard key={idx} {...post} />
            ))}
          </div>
          <div className="hidden xl:block w-72">
            <RightSidebar />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
