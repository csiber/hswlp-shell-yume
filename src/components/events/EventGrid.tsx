import EventCard, { type EventItem } from './EventCard'

export default function EventGrid({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Nincs elérhető esemény.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} />
      ))}
    </div>
  )
}
