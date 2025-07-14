import BadgeCard, { type BadgeItem } from './BadgeCard'

export default function BadgeGrid({ badges }: { badges: BadgeItem[] }) {
  if (!badges.length) {
    return (
      <div className="py-10 text-center text-muted-foreground">Nincs jelvény.</div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {badges.map((b) => (
        <BadgeCard key={b.id} badge={b} />
      ))}
    </div>
  )
}
