"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderDown, Heart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Főoldal", icon: Home },
  { href: "/my-files", label: "Fájljaim", icon: FolderDown },
  { href: "/favorites", label: "Kedvencek", icon: Heart },
  { href: "/settings", label: "Beállítások", icon: Settings },
];

export default function MobileNavBar() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-background/90 backdrop-blur py-2">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center text-xs text-muted-foreground",
              active && "text-foreground"
            )}
          >
            <Icon className="w-5 h-5 mb-1" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
