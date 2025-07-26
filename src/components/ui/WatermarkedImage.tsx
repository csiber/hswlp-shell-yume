import { cn } from '@/lib/utils'
import { useSessionStore } from '@/state/session'

export interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
}

export default function WatermarkedImage({ className, ...props }: WatermarkedImageProps) {
  const session = useSessionStore(s => s.session)
  const guest = !session?.user?.id
  return (
    <div className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} className={cn(className)} alt={props.alt || ''} />
      {guest && (
        <img
          src="/favicon.svg"
          alt="watermark"
          className="pointer-events-none select-none opacity-60 absolute bottom-1 right-1 w-6 h-6"
        />
      )}
    </div>
  )
}
