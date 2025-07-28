"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { RandomAvatar } from "@/components/RandomAvatar"
import { cn } from "@/lib/utils"

export interface UserMiniCardProps {
  user: {
    id?: string
    name: string
    email: string
    avatar?: string | null
    profileFrameEnabled?: boolean
  }
  className?: string
  currentUserId?: string
}

export function UserMiniCard({ user, className, currentUserId }: UserMiniCardProps) {

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      <Avatar
        className={cn(
          "h-10 w-10",
          user.id && user.id === currentUserId && user.profileFrameEnabled ? "avatar-ring" : ""
        )}
      >
        <AvatarImage src={user.avatar ?? ""} alt={user.name} />
        <AvatarFallback>
          <RandomAvatar name={user.email || user.name} size={40} />
        </AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <div className="font-semibold truncate max-w-[12rem]">{user.name}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[12rem]">
          {user.email}
        </div>
      </div>
    </div>
  )
}
