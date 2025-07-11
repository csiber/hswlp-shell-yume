"use client"
import * as React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Puzzle, Users, Compass, MessageCircle, Flame } from 'lucide-react'


function SidebarSection({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{className?: string}>; children: React.ReactNode }) {
  return (
    <Card className="animate-in fade-in slide-in-from-right-1">
      <CardHeader className="flex items-center gap-2 py-3">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <h3 className="text-sm font-medium">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">{children}</CardContent>
    </Card>
  )
}

export default function RightSidebar() {
  const tags = ['nuxt', 'cloudflare', 'plugin', 'typescript', 'tailwind']
  const authors = [
    { name: 'Anna', avatar: 'https://i.pravatar.cc/40?img=5' },
    { name: 'Béla', avatar: 'https://i.pravatar.cc/40?img=15' },
    { name: 'Csilla', avatar: 'https://i.pravatar.cc/40?img=25' },
  ]
  const comments = [
    { user: 'Anna', text: 'Szuper hír!', avatar: 'https://i.pravatar.cc/40?img=5' },
    { user: 'Béla', text: 'Már várom a frissítést.', avatar: 'https://i.pravatar.cc/40?img=15' },
    { user: 'Csilla', text: 'Nekem a harmadik opció tetszik.', avatar: 'https://i.pravatar.cc/40?img=25' },
  ]
  return (
    <div className="space-y-4 xl:sticky xl:top-20">
      <SidebarSection title="Neked ajánljuk" icon={Puzzle}>
        <p className="hover:underline hover:text-primary cursor-pointer">Plugin A</p>
        <p className="hover:underline hover:text-primary cursor-pointer">Plugin B</p>
        <p className="hover:underline hover:text-primary cursor-pointer">Plugin C</p>
      </SidebarSection>
      <SidebarSection title="Top szerzők" icon={Users}>
        {authors.map((a) => (
          <div key={a.name} className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Avatar className="h-6 w-6">
              <AvatarImage src={a.avatar} alt={a.name} />
              <AvatarFallback>{a.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span>@{a.name}</span>
          </div>
        ))}
      </SidebarSection>
      <SidebarSection title="Felfedezés" icon={Compass}>
        <div className="grid grid-cols-2 gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs rounded-md bg-muted px-2 py-0.5 hover:bg-muted/70 hover:scale-105 transition-all"
            >

              #{t}
            </span>
          ))}
        </div>
      </SidebarSection>
      <SidebarSection title="Legutóbbi hozzászólások" icon={MessageCircle}>
        {comments.map((c) => (
          <div key={c.text} className="flex items-start gap-2 hover:bg-muted/40 rounded-md p-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={c.avatar} alt={c.user} />
              <AvatarFallback>{c.user.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="text-xs">
              <strong>{c.user}:</strong> {c.text}
            </p>
          </div>
        ))}
      </SidebarSection>
      <SidebarSection title="Trendek ma" icon={Flame}>
        <p className="hover:underline cursor-pointer">#dark-mode</p>
        <p className="hover:underline cursor-pointer">#pluginverseny</p>
        <p className="hover:underline cursor-pointer">#yume</p>

      </SidebarSection>
    </div>
  )
}
