"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gdpr_consent";

export default function GDPRNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] bg-background border-t p-4 text-sm">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>
          This website uses cookies to enhance your experience.{' '}
          <Link href="/privacy" className="underline underline-offset-2">
            Learn more
          </Link>
        </span>
        <Button size="sm" onClick={accept}>
          Got it
        </Button>
      </div>
    </div>
  );
}
