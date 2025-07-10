"use client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  Share,
  HelpCircle,
  Lightbulb,
  Newspaper,
  BarChart3,
  Users2,
  RefreshCcw,
} from 'lucide-react'

interface Props {
  author: string
  avatar?: string
  title: string
  description: string
  date: string
  type?: string
  layout?: 'default' | 'reverse' | 'compact'
  tags?: string[]
  comments?: number
  likes?: number
}

import { formatDistanceToNow } from 'date-fns'
import { hu } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const typeMap = {
  news: { icon: Newspaper, className: 'bg-muted' },
  poll: { icon: BarChart3, className: 'border border-primary' },
  idea: { icon: Lightbulb, className: '' },
  question: { icon: HelpCircle, className: '' },
  update: { icon: RefreshCcw, className: 'bg-accent/10' },
  community: { icon: Users2, className: 'bg-secondary/20' },
} as const

export function FeedCard({
  author,
  avatar,
  title,
  description,
  date,
  type,
  layout = 'default',
  tags = [],
  comments = 0,
  likes = 0,
}: Props) {
  const initials = author.slice(0, 2).toUpperCase()
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true, locale: hu })
  const typeInfo = type ? typeMap[type as keyof typeof typeMap] : undefined
  const Icon = typeInfo?.icon
  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-shadow animate-in fade-in slide-in-from-bottom-1',
        typeInfo?.className
      )}
    >
      <CardHeader className={cn('flex items-center gap-3', layout === 'reverse' && 'flex-row-reverse')}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar ?? ''} alt={author} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className={cn(layout === 'compact' && 'text-sm')}> 
          <CardTitle className="text-base leading-none">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {author} · {timeAgo}
          </p>
        </div>
        {Icon && <Icon className="ml-auto size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="line-clamp-3">{description}</p>
        {description.length > 120 && (
          <a href="#" className="text-xs text-primary hover:underline">...tovább</a>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1 items-center">
          {type && (
            <Badge variant="outline" className="mr-1 text-[10px]" title={type}>
              {type}
            </Badge>
          )}
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] hover:scale-105 transition-transform"
              title={tag}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{comments}</span>
          </div>
          <button className="hover:text-foreground transition-colors">
            <Share className="w-4 h-4" />
            <span className="sr-only">Megosztás</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}
