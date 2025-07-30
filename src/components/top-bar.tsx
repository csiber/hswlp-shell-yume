"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  FolderDown,
  Heart,
  ShieldCheck,
  Users,
  ShoppingCart,
  Crosshair,
  CreditCard,
  Star,
} from "lucide-react";
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
import { RandomAvatar } from "@/components/RandomAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // 🆕
import { formatCredits } from "@/utils/format-credits"
import { motion } from "framer-motion";
import { useSessionStore } from "@/state/session";
import useSignOut from "@/hooks/useSignOut";
import ThemeSwitcher from "@/plugins/ShellLayout/ThemeSwitcher";
import LogoIcon from "@/components/logo-icon";
import useOnlineCount from "@/hooks/useOnlineCount";
import { CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TopBarProps {
  logo?: "hswlp" | "sociala";
}

export default function TopBar({}: TopBarProps) {
  const { session, isLoading } = useSessionStore();
  const { signOut } = useSignOut();
  const router = useRouter();
  const onlineCount = useOnlineCount();

  const user = session?.user;
  const displayName =
    user?.nickname ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? "");

  return (
    <div className="flex justify-between items-center px-4 py-2 shadow-sm bg-white dark:bg-zinc-900 overflow-x-hidden">
      <div className="flex items-center gap-2 flex-wrap max-w-full shrink-0">
        <Link href="/" className="transition-transform hover:scale-105">
          <LogoIcon className="h-8 w-8" />
        </Link>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/dashboard">
                  <Home className="size-5" />
                  <span className="sr-only">Home</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/my-files">
                  <FolderDown className="size-5" />
                  <span className="sr-only">My files</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>My uploads</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/favorites">
                  <Heart className="size-5" />
                  <span className="sr-only">Favorites</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Favorites</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/dashboard/marketplace">
                  <ShoppingCart className="size-5" />
                  <span className="sr-only">Marketplace</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Marketplace</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/requests">
                  <Crosshair className="size-5" />
                  <span className="sr-only">Requests</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Requests</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/dashboard/teams">
                  <Users className="size-5" />
                  <span className="sr-only">Teams</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Teams</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/dashboard/billing">
                  <CreditCard className="size-5" />
                  <span className="sr-only">Billing</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Billing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/dashboard/top-users">
                  <Star className="size-5" />
                  <span className="sr-only">Top Users</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Top Users</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {user?.role === "admin" && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
                >
                  <Link href="/moderation">
                    <CheckCircle2 className="size-5" />
                    <span className="sr-only">Moderation</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Moderation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="text-center animate-fade-in">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
                <span className="text-xs ml-1">{onlineCount}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Active members</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center justify-end gap-x-3 flex-wrap max-w-full shrink-0">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
              >
                <Link href="/rules">
                  <ShieldCheck className="size-5 animate-glow" />
                  <span className="sr-only">Rules</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Rules</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
                    <Avatar
                      className={cn(
                        "h-8 w-8 transition-all hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400",
                        user?.profileFrameEnabled ? "avatar-ring" : ""
                      )}
                    >
                      <AvatarImage src={user?.avatar ?? ""} alt={displayName} />
                      <AvatarFallback>
                        <RandomAvatar name={user?.id || displayName} size={32} />
                      </AvatarFallback>
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
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut().then(() => router.push("/"));
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 🟢 Kredit badge itt */}
              {user?.currentCredits != null && (
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  <motion.span
                    key={user.currentCredits}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    {formatCredits(user.currentCredits)} credits
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
