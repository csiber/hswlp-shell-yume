import { LockClosedIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

export interface BadgeItem {
  id: string
  slug: string
  name: string
  description: string
  icon_url?: string | null
  category?: string | null
  earned?: number | boolean
}

export default function BadgeCard({ badge }: { badge: BadgeItem }) {
  const earned = badge.earned === 1 || badge.earned === true
  return (
    <Card
      className={`relative flex flex-col items-center gap-2 p-4 text-center ${earned ? '' : 'opacity-50'}`}
      title={badge.description}
    >
      {badge.icon_url && (
        <div className="relative h-12 w-12">
          <Image src={badge.icon_url} alt={badge.name} fill className="object-contain" />
        </div>
      )}
      {!earned && (
        <LockClosedIcon className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-sm font-medium">{badge.name}</span>
    </Card>
  )
}
