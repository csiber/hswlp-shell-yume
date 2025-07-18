import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import ShellLayout from "@/layouts/ShellLayout";

export default async function RulesLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/");
  }
  return (
    <ShellLayout>
      <div className="flex flex-1 items-center justify-center p-6">{children}</div>
    </ShellLayout>
  );
}
