import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface DashboardItem {
  id: string
  type: "image" | "music" | "prompt"
  title: string
}

interface RecentUploadsBoxProps {
  items: DashboardItem[]
}

export function RecentUploadsBox({ items }: RecentUploadsBoxProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Legutóbbi feltöltéseim</CardTitle>
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
