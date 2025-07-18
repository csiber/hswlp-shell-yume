import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import ShellLayout from "@/layouts/ShellLayout";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/");
  }
  return (
    <ShellLayout>
      <div className="p-6 w-full">{children}</div>
    </ShellLayout>
  );
}
