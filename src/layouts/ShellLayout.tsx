import "server-only";

import LeftSidebar from "@/components/dashboard/LeftSidebar";
import FeedCenter from "@/components/dashboard/FeedCenter";
import RightSidebar from "@/components/dashboard/RightSidebar";
import TopBar from "@/components/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-full w-full flex-col">
        <TopBar />
        <div className="flex flex-1">
          <LeftSidebar />
          <FeedCenter />
          <RightSidebar />
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}
