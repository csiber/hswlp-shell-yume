"use client"

import CommunityFeedV3 from "../community/CommunityFeedV3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSessionStore } from "@/state/session"
import Link from "next/link"

export default function FeedCenter() {
  const balance = useSessionStore(
    (state) => state.session?.user?.currentCredits ?? 0
  )

  return (
    <div className="flex-1 flex flex-col gap-2 sm:gap-4 px-2 md:px-4 py-6">
      <Card className="border-yellow-400 bg-yellow-50 text-yellow-900 shadow-sm">
        <CardContent className="flex items-center justify-between">
          <span className="text-lg font-bold">
            Egyenleg: {balance} pont
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/billing">Kredit vásárlása</Link>
          </Button>
        </CardContent>
      </Card>
      <CommunityFeedV3 endpoint="/api/my-feed" />
    </div>
  )
}
