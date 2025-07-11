import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <>
      <PageHeader
        items={[
          {
            href: "/dashboard",
            label: "Dashboard"
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Legutóbbi feltöltéseim</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Kép #1
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Zene #2
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Prompt #3
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Legnépszerűbb tartalmak</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Trend #1
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Trend #2
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Trend #3
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Kedvencek &amp; lejátszási listák</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Playlist #1
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Playlist #2
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />Kedvenc #3
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-[100vh] flex-1 md:min-h-min">
          <CardHeader>
            <CardTitle>Friss közösségi feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-40 w-full rounded-lg bg-muted" />
              <div className="h-40 w-full rounded-lg bg-muted" />
              <div className="h-40 w-full rounded-lg bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
