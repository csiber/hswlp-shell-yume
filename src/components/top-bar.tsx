"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, FolderDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // 🆕
import { motion } from "framer-motion";
import { useSessionStore } from "@/state/session";
import useSignOut from "@/hooks/useSignOut";
import ThemeSwitcher from "@/plugins/ShellLayout/ThemeSwitcher";
import LogoIcon from "@/components/logo-icon";

interface TopBarProps {
  logo?: "hswlp" | "sociala";
}

export default function TopBar({}: TopBarProps) {
  const { session, isLoading } = useSessionStore();
  const { signOut } = useSignOut();
  const router = useRouter();

  const user = session?.user;
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex justify-between items-center px-4 py-2 shadow-sm bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <Link href="/" className="transition-transform hover:scale-105">
          <LogoIcon className="h-8 w-8" />
        </Link>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
        >
          <Link href="/dashboard">
            <Home className="size-5" />
            <span className="sr-only">Kezdőlap</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
        >
          <Link href="/my-files">
            <FolderDown className="size-5" />
            <span className="sr-only">Fájljaim</span>
          </Link>
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground animate-fade-in">
        🚀 új funkciók hamarosan!
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />

        <div className="flex flex-col items-center">
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 p-0"
                  >
                    <Avatar className="h-8 w-8 transition-all hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400">
                      <AvatarImage src={user?.avatar ?? ""} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user && (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        {displayName}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Beállítások
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut().then(() => router.push("/"));
                    }}
                  >
                    Kijelentkezés
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 🟢 Kredit badge itt */}
              {user?.currentCredits != null && (
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  <motion.span key={user.currentCredits} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    {user.currentCredits} kredit
                  </motion.span>
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
