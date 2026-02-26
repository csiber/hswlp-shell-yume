"use client";

import TopBar from "@/components/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ShellMobile from "@/app/shell/ShellMobile";
import useMobileMode from "@/hooks/useMobileMode";

type ShellLayoutProps = {
  children?: React.ReactNode;
};

export default function ShellLayout({ children }: ShellLayoutProps) {
  const isMobile = useMobileMode();

  if (isMobile) {
    return <ShellMobile>{children}</ShellMobile>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-full w-full flex-col px-2 pb-4 md:px-3">
        <TopBar />
        <div className="grid flex-1 grid-cols-12 pt-3">
          <main className="col-span-12 app-surface rounded-2xl p-3 md:p-5">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
