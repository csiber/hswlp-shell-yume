"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonPost() {
  return (
    <div className="space-y-2 rounded-lg bg-white dark:bg-zinc-900 p-4 shadow">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  )
}

