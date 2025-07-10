"use client"
import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="animate-in fade-in slide-in-from-right-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">{children}</CardContent>
    </Card>
  )
}

export default function RightSidebar() {
  const tags = ['nuxt', 'cloudflare', 'plugin', 'typescript', 'tailwind']
  return (
    <div className="space-y-4">
      <SidebarSection title="Neked ajánljuk">
        <p>Plugin A</p>
        <p>Plugin B</p>
        <p>Plugin C</p>
      </SidebarSection>
      <SidebarSection title="Top szerzők">
        <p>@user1</p>
        <p>@user2</p>
        <p>@user3</p>
      </SidebarSection>
      <SidebarSection title="Felfedezés">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="text-xs rounded-md bg-muted px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      </SidebarSection>
      <SidebarSection title="Legutóbbi hozzászólások">
        <p>
          <strong>Anna:</strong> Szuper hír!
        </p>
        <p>
          <strong>Béla:</strong> Már várom a frissítést.
        </p>
        <p>
          <strong>Csilla:</strong> Nekem a harmadik opció tetszik.
        </p>
      </SidebarSection>
      <SidebarSection title="Trendek ma">
        <p>#dark-mode</p>
        <p>#pluginverseny</p>
        <p>#yume</p>
      </SidebarSection>
    </div>
  )
}
