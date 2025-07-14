import Link from "next/link";
import { NavUser } from "@/components/nav-user";

interface UserInfo {
  id?: string
  name: string
  email: string
  credits: number
}

export default function SidebarLeft({ user }: { user?: UserInfo }) {
  return (
    <div className="w-[250px] bg-white dark:bg-gray-900 p-4 flex flex-col gap-6 text-sm">
      {/* New Feeds szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">New Feeds</h3>
        <ul className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-4">
          <li>
            <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📰</span>
              <span>Newsfeed</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/badges" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">🏅</span>
              <span>Badges</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/explore-stories" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">🌍</span>
              <span>Explore Stories</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/popular-groups" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">💥</span>
              <span>Popular Groups</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/author-profile" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">👤</span>
              <span>Author Profile</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* More Pages szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">More Pages</h3>
        <ul className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-4">
          <li>
            <Link href="/dashboard/email-box" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📬</span>
              <span>Email Box</span>
              <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">584</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/near-hotel" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">🏨</span>
              <span>Near Hotel</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/latest-event" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📍</span>
              <span>Latest Event</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/live-stream" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📹</span>
              <span>Live Stream</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Account szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">Account</h3>
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/settings" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </Link>
          </li>
          {user?.id && (
            <li>
              <Link href={`/profile/${user.id}`} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="text-lg">👤</span>
                <span>Profilom</span>
              </Link>
            </li>
          )}
          <li>
            <Link href="/dashboard/analytics" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/chat" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">💬</span>
              <span>Chat</span>
              <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">23</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
        <NavUser />
      </div>
    </div>
  );
}
