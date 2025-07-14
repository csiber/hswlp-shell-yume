import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ExploreFiltersProps {
  currentType: string | null | undefined
}

export default function ExploreFilters({ currentType }: ExploreFiltersProps) {
  const tabs = [
    { type: undefined, label: 'Összes' },
    { type: 'image', label: 'Képek' },
    { type: 'music', label: 'Zenék' },
    { type: 'prompt', label: 'Promtok' },
  ]

  return (
    <div className="mb-4 flex gap-3">
      {tabs.map((tab) => {
        const active =
          currentType === tab.type || (currentType == null && tab.type === undefined)
        return (
          <Button key={tab.label} asChild variant={active ? 'default' : 'outline'}>
            <Link href={tab.type ? `/dashboard/explore?type=${tab.type}` : '/dashboard/explore'}>
              {tab.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
