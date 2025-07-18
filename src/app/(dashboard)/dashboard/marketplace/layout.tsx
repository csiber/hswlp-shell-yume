import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";


export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/");
  }
  return <div className="p-6 w-full">{children}</div>;
}
