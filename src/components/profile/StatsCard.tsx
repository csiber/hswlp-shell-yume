import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  className?: string
}

export function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
        </div>
        {icon ? <div className="text-3xl leading-none text-primary/80">{icon}</div> : null}
      </div>
      {description ? <p className="mt-3 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export default StatsCard
