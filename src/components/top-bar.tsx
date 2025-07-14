"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Mail, Home } from "lucide-react";
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
import { useSessionStore } from "@/state/session";
import useSignOut from "@/hooks/useSignOut";
import ThemeSwitcher from "@/plugins/ShellLayout/ThemeSwitcher";

interface TopBarProps {
  logo?: "hswlp" | "sociala";
}

export default function TopBar({ logo = "hswlp" }: TopBarProps) {
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
        <Link href="/" className="text-lg font-bold">
          {logo === "sociala" ? "Sociala" : "HSWLP"}
        </Link>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Link href="/dashboard">
            <Home className="size-5" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>
      </div>
      <div className="flex-1 px-4 hidden sm:block">
        <input
          type="text"
          placeholder="Start typing to search..."
          className="w-full rounded-full bg-muted px-4 py-2 text-sm focus:outline-none dark:bg-zinc-800"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Bell className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Mail className="size-5" />
        </Button>
        <ThemeSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 p-0"
            >
              {isLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar ?? ""} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              )}
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
            <DropdownMenuItem
              onClick={() => router.push(`/profile/${user?.id}`)}
            >
              Profil
            </DropdownMenuItem>
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
      </div>
    </div>
  );
}
