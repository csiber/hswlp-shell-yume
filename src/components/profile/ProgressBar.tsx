import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  label?: string
  helperText?: string
  className?: string
}

export function ProgressBar({ value, label, helperText, className }: ProgressBarProps) {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100)

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <div className="flex items-center justify-between text-sm font-medium">{label}<span>{percentage}%</span></div> : null}
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}

export default ProgressBar
