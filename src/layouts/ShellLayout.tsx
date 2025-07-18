"use client";

import TopBar from "@/components/top-bar";
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
          <main className="col-span-12">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
