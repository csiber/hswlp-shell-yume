import "server-only"

import SidebarLeft from "@/components/shell/SidebarLeft"
import FeedCenter from "@/components/shell/FeedCenter"
import RightSidebar from "@/components/shell/RightSidebar"
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
