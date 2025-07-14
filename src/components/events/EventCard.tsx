import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import dayjs from 'dayjs'

export interface EventItem {
  id: string
  title: string
  slug: string
  description: string
  date: string
  location: string
  cover_url?: string | null
}

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <Card className="overflow-hidden">
      {event.cover_url && (
        <div className="relative h-40 w-full">
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {dayjs(event.date).format('YYYY.MM.DD HH:mm')} – {event.location}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">{event.description}</p>
        <div className="mt-4">
          <a
            href={`#`}
            className="inline-block rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Részletek
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
