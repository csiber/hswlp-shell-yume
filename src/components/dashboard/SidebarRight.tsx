import "server-only"

const contacts = ["Alice", "Bob", "Charlie"]
const groups = ["Design", "Music", "AI"]
const suggestions = ["Follow Yume", "Try Premium"]

export default function SidebarRight() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 p-4 space-y-6 overflow-y-auto bg-muted/50">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Kapcsolatok</h3>
        <ul className="space-y-2 text-sm">
          {contacts.map((name) => (
            <li key={name} className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary" />
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Csoportok</h3>
        <ul className="space-y-2 text-sm">
          {groups.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Ajánlások</h3>
        <ul className="space-y-2 text-sm">
          {suggestions.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
