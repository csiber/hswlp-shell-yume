"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/constants";

import { useSessionStore } from "@/state/session";
import { useNavStore } from "@/state/nav";
import LogoIcon from "@/components/logo-icon";
import { Menu } from "lucide-react";

type NavItem = {
  name: string;
  href: Route;
};

const ActionButtons = () => {
  const { session, isLoading } = useSessionStore();
  const { setIsOpen } = useNavStore();

  if (isLoading) return <Skeleton className="h-10 w-[80px] bg-primary" />;
  if (session) return null;

  return (
    <div className="flex gap-2">
      <Button asChild onClick={() => setIsOpen(false)}>
        <Link href="/sign-in">Login</Link>
      </Button>
      <Button asChild variant="secondary" onClick={() => setIsOpen(false)}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
};

export function Navigation() {
  const pathname = usePathname() ?? "";
  const { session, isLoading } = useSessionStore();
  const { isOpen, setIsOpen } = useNavStore();

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" as Route },
    { name: "Search", href: "/search" as Route },
    { name: "Trending", href: "/trending" as Route },
    { name: "Random", href: "/random" as Route },
    ...(session
      ? [
          { name: "Dashboard", href: "/dashboard" as Route },
          { name: "Settings", href: "/settings" as Route },
        ]
      : []),
  ];

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="bg-background/70 ring-1 ring-border dark:bg-muted/30 backdrop-blur-md shadow-sm dark:shadow-lg z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary transition-colors"
          >
            <LogoIcon className="w-6 h-6 md:w-7 md:h-7 dark:fill-yellow-400 fill-yellow-600" />
            {SITE_NAME}
          </Link>

          {/* Desktop */}
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
                        "text-sm font-medium px-3 h-16 flex items-center no-underline relative text-muted-foreground hover:text-foreground transition-colors duration-200",
                        isActiveLink(item.href) &&
                          "text-foreground after:absolute after:left-3 after:bottom-2 after:h-[2px] after:w-[calc(100%-1.5rem)] after:bg-primary after:rounded-full after:transition-all after:duration-300"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
            </div>
            <ActionButtons />
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-6">
                  <Menu className="w-9 h-9" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[240px] sm:w-[300px] px-4 py-6 bg-background/80 backdrop-blur-md ring-1 ring-border dark:bg-muted/40"
              >
                <div className="space-y-4">
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
                            "block px-4 py-2 text-base font-medium rounded-md no-underline transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            isActiveLink(item.href) &&
                              "text-foreground bg-muted/30"
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <div className="pt-6">
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
