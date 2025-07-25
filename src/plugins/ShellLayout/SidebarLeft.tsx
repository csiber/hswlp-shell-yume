import Link from "next/link";

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  credits: number;
}

export default function SidebarLeft({ user }: { user?: UserInfo }) {
  return (
    <div className="w-[250px] dark:bg-gray-900 p-4 flex flex-col gap-6 text-sm">
      {/* Feed szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">Feed</h3>
        <ul className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-4">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">📰</span>
              <span>Newsfeed</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/explore"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">🌍</span>
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/live"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">📺</span>
              <span>Live</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/groups"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">💥</span>
              <span>Groups</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Community section */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">Community</h3>
        <ul className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-4">
          <li>
            <Link
              href="/dashboard/events"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">📍</span>
              <span>Events</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">💬</span>
              <span>Chat</span>
              <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">
                23
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/badges"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">🏅</span>
              <span>Badges</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* My account section */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">My Account</h3>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/settings"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </Link>
          </li>
          {user?.id && (
            <li>
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-lg">👤</span>
                <span>Profile</span>
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
