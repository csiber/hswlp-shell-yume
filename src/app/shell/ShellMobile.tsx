"use client";
import { useEffect } from "react";
import MobileNavBar from "@/components/MobileNavBar";
import FloatingUploadButton from "@/components/FloatingUploadButton";
import InstallPrompt from "@/components/InstallPrompt";
import { Navigation } from "@/components/navigation";

export default function ShellMobile({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("mobile-ui");
    return () => {
      document.body.classList.remove("mobile-ui");
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <MobileNavBar />
      <FloatingUploadButton />
      <InstallPrompt />
    </div>
  );
}
