"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Menu, ComponentIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/constants";

import { useSessionStore } from "@/state/session";
import { useNavStore } from "@/state/nav";

type NavItem = {
  name: string;
  href: Route;
};

// Akciógombok jobbra: csak bejelentkezés gomb, ha nincs session
const ActionButtons = () => {
  const { session, isLoading } = useSessionStore();
  const { setIsOpen } = useNavStore();

  if (isLoading) return <Skeleton className="h-10 w-[80px] bg-primary" />;
  if (session) return null;

  return (
    <Button asChild onClick={() => setIsOpen(false)}>
      <Link href="/sign-in">Bejelentkezés</Link>
    </Button>
  );
};

// Teljes navigációs komponens
export function Navigation() {
  const pathname = usePathname() ?? "";
  const { session, isLoading } = useSessionStore();
  const { isOpen, setIsOpen } = useNavStore();

  // Menüelemek dinamikusan session alapján
  const navItems: NavItem[] = [
    { name: "Főoldal", href: "/" },
    ...(session
      ? [
          { name: "Vezérlőpult", href: "/dashboard" as Route },
          { name: "Beállítások", href: "/settings" as Route },
        ]
      : []),
  ];

  // Aktív link meghatározása
  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="bg-muted/60 dark:bg-muted/30 shadow dark:shadow-xl z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo és név */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary"
          >
            <ComponentIcon className="w-6 h-6 md:w-7 md:h-7" />
            {SITE_NAME}
          </Link>

          {/* Desktop navigáció */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-2">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-8 w-16" />)
                : navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium px-3 h-16 flex items-center no-underline transition-colors relative text-muted-foreground hover:text-foreground",
                        isActiveLink(item.href) &&
                          "text-foreground after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
            </div>
            <ActionButtons />
          </div>

          {/* Mobilmenü (hamburger) */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-6">
                  <Menu className="w-9 h-9" />
                  <span className="sr-only">Menü megnyitása</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="mt-6 space-y-2">
                  {isLoading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))
                  ) : (
                    <>
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-3 py-2 text-base font-medium no-underline transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            isActiveLink(item.href) && "text-foreground"
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <div className="px-3 pt-4">
                        <ActionButtons />
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
