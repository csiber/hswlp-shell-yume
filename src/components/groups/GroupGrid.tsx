"use client"

import GroupCard, { type GroupItem } from './GroupCard'

export default function GroupGrid({ groups }: { groups: GroupItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} />
      ))}
    </div>
  )
}
