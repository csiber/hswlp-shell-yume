"use client";
import { useEffect } from "react";
import usePlayerVisible from "@/hooks/usePlayerVisible";
import MobileNavBar from "@/components/MobileNavBar";
import FloatingUploadButton from "@/components/FloatingUploadButton";
import InstallPrompt from "@/components/InstallPrompt";

export default function ShellMobile({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("mobile-ui");
    return () => {
      document.body.classList.remove("mobile-ui");
    };
  }, []);

  const isPlayerVisible = usePlayerVisible();
  const bottomSpace = isPlayerVisible ? "pb-[96px]" : "pb-[24px]";

  return (
    <div className="min-h-screen flex flex-col">
      <main className={`flex-1 overflow-y-auto px-2 pt-4 overflow-x-hidden ${bottomSpace}`}>{children}</main>
      <MobileNavBar />
      <FloatingUploadButton />
      <InstallPrompt />
    </div>
  );
}
