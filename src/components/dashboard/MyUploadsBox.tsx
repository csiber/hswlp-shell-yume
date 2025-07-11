import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, ScrollText } from "lucide-react"

export interface UploadItem {
  id: string
  type: "image" | "music" | "prompt"
  title: string
  url: string
}

interface MyUploadsBoxProps {
  items: UploadItem[]
}

export function MyUploadsBox({ items }: MyUploadsBoxProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Feltöltéseim</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              {item.type === "image" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </>
              ) : item.type === "music" ? (
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <ScrollText className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col">
                <a
                  href={item.url}
                  className="font-medium text-sm hover:underline"
                  target="_blank"
                >
                  {item.title}
                </a>
                {item.type === "music" && (
                  <audio
                    src={item.url}
                    controls
                    className="mt-1 w-64 max-w-full"
                  />
                )}
                {item.type === "prompt" && (
                  <iframe
                    src={item.url}
                    className="mt-1 w-64 h-24 rounded-sm border"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
