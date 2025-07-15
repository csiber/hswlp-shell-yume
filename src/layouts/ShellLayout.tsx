import "server-only"

import TopBar from "@/components/top-bar"

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
