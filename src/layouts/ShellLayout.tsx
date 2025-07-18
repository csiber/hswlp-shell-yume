"use client";

import LeftSidebar from "@/components/dashboard/LeftSidebar";
import TopBar from "@/components/top-bar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

type ShellLayoutProps = {
  children?: React.ReactNode;
};

export default function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-full w-full flex-col">
        <TopBar />
        <div className="flex flex-1">
          <LeftSidebar />
          <main className="flex-1">{children}</main>
          <RightSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
}
