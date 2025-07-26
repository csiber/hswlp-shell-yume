"use client"

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import WatermarkedImage from './WatermarkedImage'

export interface NsfwImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  blurred?: boolean
}

export default function NsfwImage({ blurred = false, className, ...props }: NsfwImageProps) {
  return (
    <div className="relative">
      <WatermarkedImage
        {...props}
        alt={props.alt || ''}
        className={cn(className, blurred && 'blur-md')}
      />
      {blurred && (
        <>
          <div className="absolute inset-0 rounded-md bg-black/40 backdrop-blur-sm" />
          <Badge variant="destructive" className="absolute top-2 left-2">
            NSFW
          </Badge>
        </>
      )}
    </div>
  )
}
