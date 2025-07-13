import "server-only"

import SidebarLeft from "@/components/dashboard/SidebarLeft"
import FeedCenter from "@/components/dashboard/FeedCenter"
import RightSidebar from "@/components/dashboard/RightSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <SidebarLeft />
        <FeedCenter />
        <RightSidebar />
      </div>
      {children}
    </SidebarProvider>
  )
}
