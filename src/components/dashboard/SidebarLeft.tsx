import "server-only"

import SidebarLeftPlugin from "@/plugins/ShellLayout/SidebarLeft"
import { getSessionFromCookie } from "@/utils/auth"

export default async function SidebarLeft() {
  const session = await getSessionFromCookie()
  const user = session?.user
    ? {
        name:
          userFullName(session.user) ?? session.user.email,
        email: session.user.email,
        credits: session.user.currentCredits ?? 0,
      }
    : undefined
  return <SidebarLeftPlugin user={user} />
}

function userFullName(u: { firstName?: string | null; lastName?: string | null }) {
  return u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : null
}
