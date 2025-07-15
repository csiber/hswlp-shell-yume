"use client";

import ShellLayout from "@/layouts/ShellLayout";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsBreadcrumbs } from "./settings-breadcrumbs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellLayout
      center={
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <SettingsBreadcrumbs />
          </header>
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
              <SettingsSidebar />
            </aside>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      }
    >
      {/* Footer vagy extra alulra jövő cucc */}
    </ShellLayout>
  );
}
