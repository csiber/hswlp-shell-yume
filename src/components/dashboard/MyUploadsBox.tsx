import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface UploadItem {
  id: string;
  type: "image" | "music" | "prompt";
  title: string;
  url: string;
}

interface MyUploadsBoxProps {
  items: UploadItem[];
}

export function MyUploadsBox({ items }: MyUploadsBoxProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Feltöltéseim</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-muted" />
              <a href={item.url} className="hover:underline">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
