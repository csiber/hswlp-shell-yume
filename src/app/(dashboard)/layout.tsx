import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import ShellLayout from "@/layouts/ShellLayout";

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

  return <ShellLayout>{children}</ShellLayout>;
}
