import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ExploreFiltersProps {
  currentType?: string
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
      {tabs.map((tab) => (
        <Button
          key={tab.label}
          asChild
          variant={currentType === tab.type ? 'default' : 'outline'}
        >
          <Link href={tab.type ? `/dashboard/explore?type=${tab.type}` : '/dashboard/explore'}>
            {tab.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
