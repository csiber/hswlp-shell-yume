"use client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share } from 'lucide-react'

interface Props {
  author: string
  avatar?: string
  title: string
  description: string
  date: string
  type?: string
  tags?: string[]
  comments?: number
  likes?: number
}

import { formatDistanceToNow } from 'date-fns'
import { hu } from 'date-fns/locale'

export function FeedCard({
  author,
  avatar,
  title,
  description,
  date,
  type,
  tags = [],
  comments = 0,
  likes = 0,
}: Props) {
  const initials = author.slice(0, 2).toUpperCase()
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true, locale: hu })
  return (
    <Card className="hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-1">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar ?? ''} alt={author} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base leading-none">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {author} · {timeAgo}
          </p>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1 items-center">
          {type && (
            <Badge variant="outline" className="mr-1 text-[10px]">
              {type}
            </Badge>
          )}
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
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
