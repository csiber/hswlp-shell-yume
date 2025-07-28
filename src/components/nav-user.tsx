"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RandomAvatar } from "@/components/RandomAvatar"
import { Badge } from "@/components/ui/badge"
import { formatCredits } from "@/utils/format-credits"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useSessionStore } from "@/state/session"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavUser() {
  const { session, isLoading } = useSessionStore()
  const router = useRouter()

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="h-16">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1 flex-1 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const user = session?.user
  if (!user) return null

  const name =
    user.nickname ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          onClick={() => router.push("/profile")}
          className="h-16 hover:bg-secondary/70 dark:hover:bg-secondary/20"
        >
          <Avatar
            className={cn(
              "h-10 w-10",
              user.profileFrameEnabled ? "avatar-ring" : ""
            )}
          >
            <AvatarImage src={user.avatar ?? ""} alt={name} />
            <AvatarFallback>
              <RandomAvatar name={user.id || user.email || name} size={40} />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 gap-0.5 text-left">
            <span className="font-semibold truncate leading-none">{name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            <Badge variant="secondary" className="w-fit text-[10px] mt-1">
              {formatCredits(user.currentCredits)} credits
            </Badge>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
