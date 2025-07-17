import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

  const path =
    headers().get("x-pathname") ||
    headers().get("x-invoke-path") ||
    headers().get("x-matched-path") ||
    headers().get("next-url") ||
    "";

  if (path.startsWith("/dashboard/marketplace")) {
    return <ShellLayout center={<div className="p-6 w-full">{children}</div>} />;
  }

  return <ShellLayout center={<FeedCenter />}>{children}</ShellLayout>;
}
