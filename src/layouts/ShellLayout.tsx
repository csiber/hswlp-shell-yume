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
        <div className="grid flex-1 grid-cols-12">
          <div className="col-span-2">
            <LeftSidebar />
          </div>
          <main className="col-span-8">{children}</main>
          <div className="hidden lg:block lg:col-span-2">
            <RightSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
