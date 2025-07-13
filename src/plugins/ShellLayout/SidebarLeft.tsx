import Link from "next/link";

export default function SidebarLeft() {
  return (
    <div className="w-[250px] bg-white dark:bg-gray-900 p-4 flex flex-col gap-6 text-sm">
      {/* New Feeds szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">New Feeds</h3>
        <ul className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-4">
          <li>
            <Link href="/" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📰</span>
              <span>Newsfeed</span>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">🏅</span>
              <span>Badges</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">🌍</span>
              <span>Explore Stories</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">💥</span>
              <span>Popular Groups</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">👤</span>
              <span>Author Profile</span>
            </a>
          </li>
        </ul>
      </div>

      {/* More Pages szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">More Pages</h3>
        <ul className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-4">
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📬</span>
              <span>Email Box</span>
              <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">584</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">🏨</span>
              <span>Near Hotel</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📍</span>
              <span>Latest Event</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📹</span>
              <span>Live Stream</span>
            </a>
          </li>
        </ul>
      </div>

      {/* Account szekció */}
      <div>
        <h3 className="uppercase text-xs text-gray-400 mb-3 px-2">Account</h3>
        <ul className="flex flex-col gap-1">
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-lg">💬</span>
              <span>Chat</span>
              <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">23</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
