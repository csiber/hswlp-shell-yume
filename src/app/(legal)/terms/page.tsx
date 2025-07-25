import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CREDITS_EXPIRATION_YEARS } from "@/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Yumekai terms of use and service policy.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-foreground mb-8">
        Terms of Service
      </h1>

      <p className="text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          1. Acceptance of terms
        </h2>
        <p className="text-muted-foreground">
          By accessing and using the website you agree that these terms of use
          are binding upon you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          2. License to use
        </h2>
        <p className="text-muted-foreground">
          You may download and view one copy of Yumekai content for personal and
          non-commercial use on a temporary basis. Any other use requires prior
          written permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          3. Disclaimer
        </h2>
        <p className="text-muted-foreground">
          Content on this site is provided &quot;as is&quot;. Yumekai gives no express or
          implied warranties including fitness for a particular purpose or
          non-infringement of intellectual property rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          4. Kreditrendszer és fizetések
        </h2>
        <p className="text-muted-foreground mb-4">
          Yumekai operates on a credit-based system. Purchased credits are valid for {CREDITS_EXPIRATION_YEARS} years from the date of purchase and payments are processed securely via Stripe.
        </p>
        <p className="text-muted-foreground mb-4">
          After a successful payment credits are added immediately to your account. Credits are non-refundable and package prices or availability may change without notice.
        </p>
        <p className="text-muted-foreground">
          Free credits may be offered through promotions or monthly grants. Different rules and expiration terms may apply which we will announce separately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          5. Limitations
        </h2>
        <p className="text-muted-foreground">
          Yumekai and its partners are not liable for any damages arising from
          the use or inability to use the site including but not limited to
          loss of data, business interruption or loss of revenue.
        </p>
      </section>

      <div className="mt-12 text-center">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </>
  );
}
