"use client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, Download } from 'lucide-react'

interface Props {
  author: string
  avatar?: string
  title: string
  description: string
  tags?: string[]
}

export function FeedCard({ author, avatar, title, description, tags = [] }: Props) {
  const initials = author.slice(0,2).toUpperCase()
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar ?? ''} alt={author} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base leading-none">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{author}</p>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Download className="w-4 h-4" />
          <span>42</span>
          <Heart className="w-4 h-4 ml-3" />
          <span>7</span>
        </div>
      </CardFooter>
    </Card>
  )
}
