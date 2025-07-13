import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Person {
  name: string
  avatar: string
}

function FriendRequestCard({ person }: { person: Person }) {
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={person.avatar} alt={person.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{person.name}</span>
      </div>
      <div className="flex gap-1">
        <Button size="sm">Accept</Button>
        <Button size="sm" variant="secondary">
          Decline
        </Button>
      </div>
    </div>
  )
}

function FriendRequests() {
  const people: Person[] = [
    { name: "Anna Keller", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Mohsen Aziz", avatar: "https://i.pravatar.cc/150?img=24" },
  ]
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Friend Requests</h3>
      <div className="space-y-3">
        {people.map((person) => (
          <FriendRequestCard key={person.name} person={person} />
        ))}
      </div>
    </section>
  )
}

function OnlineFriends() {
  const friends: Person[] = [
    { name: "Jane Doe", avatar: "https://i.pravatar.cc/150?img=31" },
    { name: "Anna Keller", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Mohsen Aziz", avatar: "https://i.pravatar.cc/150?img=24" },
  ]
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Online Friends</h3>
      <ul className="max-h-[300px] space-y-2 overflow-y-auto pr-1 text-sm">
        {friends.map((friend) => (
          <li key={friend.name} className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border-2 border-green-500">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback>
                {friend.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {friend.name}
          </li>
        ))}
      </ul>
    </section>
  )
}

function SuggestedPeople() {
  const suggestions: Person[] = [
    { name: "Chris Lee", avatar: "https://i.pravatar.cc/150?img=45" },
    { name: "Mary Ann", avatar: "https://i.pravatar.cc/150?img=56" },
  ]
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Suggested</h3>
      <ul className="space-y-2 text-sm">
        {suggestions.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={s.avatar} alt={s.name} />
                <AvatarFallback>
                  {s.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {s.name}
            </div>
            <Button size="sm">Add Friend</Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function RightSidebar() {
  return (
    <aside className="hidden w-[280px] space-y-6 px-4 py-6 xl:block">
      <FriendRequests />
      <OnlineFriends />
      <SuggestedPeople />
    </aside>
  )
}

