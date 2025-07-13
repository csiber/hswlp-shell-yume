import "server-only"

import SidebarLeft from "@/components/shell/SidebarLeft"
import FeedCenter from "@/components/shell/FeedCenter"
import SidebarRight from "@/components/shell/SidebarRight"
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
        <SidebarRight />
      </div>
      {children}
    </SidebarProvider>
  )
}
