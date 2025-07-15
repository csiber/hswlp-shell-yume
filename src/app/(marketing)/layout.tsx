"use client";

import ShellLayout from "@/layouts/ShellLayout";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellLayout
      center={
        <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
          <header className="mb-4">
            <h1 className="text-2xl font-bold">Component Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Vásárolj és használj prémium komponenseket kreditjeid
              felhasználásával
            </p>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      }
    />
  );
}
