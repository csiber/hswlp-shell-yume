"use client"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function RightSidebar() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Neked ajánljuk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Plugin A</p>
          <p>Plugin B</p>
          <p>Plugin C</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top szerzők</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>@user1</p>
          <p>@user2</p>
          <p>@user3</p>
        </CardContent>
      </Card>
    </div>
  )
}
