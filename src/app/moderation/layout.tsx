import { requireAdmin } from '@/utils/auth'
import ShellLayout from '@/layouts/ShellLayout'

export default async function ModerationLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <ShellLayout center={<div className="p-6 w-full">{children}</div>} />
}
