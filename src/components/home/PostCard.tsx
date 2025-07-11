"use client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share, HelpCircle, Lightbulb, Newspaper, BarChart3, Users2, RefreshCcw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { hu } from 'date-fns/locale'
import { cn } from '@/lib/utils'

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

const typeMap = {
  news: { icon: Newspaper, className: 'bg-muted' },
  poll: { icon: BarChart3, className: 'border border-primary bg-background' },
  idea: { icon: Lightbulb, className: 'bg-yellow-500/10 dark:bg-yellow-400/10' },
  question: { icon: HelpCircle, className: 'bg-blue-500/10 dark:bg-blue-400/10' },
  update: { icon: RefreshCcw, className: 'bg-accent/10' },
  community: { icon: Users2, className: 'bg-secondary/20' },
} as const

export function PostCard({
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
        'rounded-3xl shadow-sm hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-1',
        typeInfo?.className
      )}
    >
      <CardHeader className={cn('flex items-center gap-3 p-4 pb-2', layout === 'reverse' && 'flex-row-reverse')}> 
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar ?? ''} alt={author} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className={cn('leading-relaxed', layout === 'compact' && 'text-sm')}> 
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{author} · {timeAgo}</p>
        </div>
        {Icon && <Icon className="ml-auto size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
        <p className="leading-relaxed line-clamp-3">{description}</p>
        {description.length > 120 && (
          <a href="#" className="text-xs text-primary hover:underline">...tovább</a>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
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

export default PostCard
