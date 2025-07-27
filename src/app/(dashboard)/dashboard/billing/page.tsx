import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { TransactionHistory } from "./_components/transaction-history";
import { CreditPackages } from "./_components/credit-packages";

export default async function BillingPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      <div className="h-4" /> {/* spacer instead of header */}
      <div className="container mx-auto px-5 pb-12">
        <CreditPackages />
        <div className="mt-4">
          <TransactionHistory />
        </div>
      </div>
    </>
  );
}
