"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import ThemeSwitch from '@/components/theme-switch'
import { useSessionStore } from '@/state/session'
import useSignOut from '@/hooks/useSignOut'

function LanguageSwitch() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="font-semibold">HU</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>HU</DropdownMenuItem>
        <DropdownMenuItem>EN</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function HomeNavbar() {
  const { session } = useSessionStore()
  const { signOut } = useSignOut()
  const router = useRouter()
  const user = session?.user
  const displayName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
    : ''

  return (
    <nav className="fixed inset-x-0 top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center gap-3 px-4">
        <SidebarTrigger className="-ml-1" />
        <Link href="/" className="font-semibold">Yume</Link>
        <div className="hidden md:block flex-1">
          <Input type="search" placeholder="Keresés..." className="h-8" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitch />
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
            <span className="sr-only">Értesítések</span>
          </Button>
          <ThemeSwitch />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar !== null ? user.avatar : undefined} alt={displayName} />
                    <AvatarFallback className="uppercase text-xs">
                      {displayName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Fiók beállítások
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut().then(() => router.push('/'))}
                >
                  Kijelentkezés
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
