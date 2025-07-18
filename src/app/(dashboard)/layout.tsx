import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import ShellLayout from "@/layouts/ShellLayout";
import FeedCenter from "@/components/dashboard/FeedCenter";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    return redirect("/");
  }

  return (
    <ShellLayout>
      <FeedCenter />
      {children}
    </ShellLayout>
  );
}
