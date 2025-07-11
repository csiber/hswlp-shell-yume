import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardItem } from "./RecentUploadsBox"

interface TrendingBoxProps {
  items: DashboardItem[]
}

export function TrendingBox({ items }: TrendingBoxProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Legnépszerűbb tartalmak</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-muted" />
              {item.title}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
