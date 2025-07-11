import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardItem } from "./RecentUploadsBox"

interface CommunityFeedBoxProps {
  items: DashboardItem[]
}

export function CommunityFeedBox({ items }: CommunityFeedBoxProps) {
  return (
    <Card className="min-h-[100vh] flex-1 md:min-h-min">
      <CardHeader>
        <CardTitle>Friss közösségi feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="h-40 w-full rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
