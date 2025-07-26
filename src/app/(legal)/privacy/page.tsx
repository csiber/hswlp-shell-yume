import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how we handle and protect your data in the Yumekai system.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-foreground mb-8">
        Privacy Policy
      </h1>

      <p className="text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          1. What data do we collect
        </h2>
        <p className="text-muted-foreground">
          While using Yumekai we collect data you provide such as your name,
          email address and any other information you voluntarily share with us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          2. How we use your data
        </h2>
        <p className="text-muted-foreground">
          We use the collected data for the following purposes:
        </p>
        <ul className="list-disc pl-6 mt-2 text-muted-foreground">
          <li>Operating, developing and maintaining our services</li>
          <li>Sending technical notices and support messages</li>
          <li>Responding to feedback and questions</li>
          <li>Protecting against abuse, fraud or unauthorized use</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          3. Data security
        </h2>
        <p className="text-muted-foreground">
          We apply appropriate technical and organizational measures to protect
          your data from loss, unauthorized access, modification or deletion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          4. Contact
        </h2>
        <p className="text-muted-foreground">
          If you have questions about this policy you can reach us at:
          <br />
          E-mail: privacy@yumekai.app
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
