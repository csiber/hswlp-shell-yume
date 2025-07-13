"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface UserMiniCardProps {
  user: { id?: string; name: string; email: string; avatar?: string | null }
  className?: string
}

export function UserMiniCard({ user, className }: UserMiniCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar ?? ""} alt={user.name} />
        <AvatarFallback>{initials}</AvatarFallback>
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
