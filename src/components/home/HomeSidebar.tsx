"use client"
import Link from 'next/link'
import { Home, User, FileText, Compass } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail
} from '@/components/ui/sidebar'

const navItems = [
  { href: '#', label: 'Közösség', icon: Home },
  { href: '#', label: 'Fiókom', icon: User },
  { href: '#', label: 'Saját tartalmak', icon: FileText },
  { href: '#', label: 'Felfedezés', icon: Compass }
]

export default function HomeSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r" >
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
