import 'server-only'
import { getDB } from '@/db'
import { userBadgeTable, userTable } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { BADGE_DEFINITIONS, BadgeKey } from '@/constants'
import { sendEmail } from './email'
import { renderNewBadgeEmail } from './new-badge-email'

export async function awardBadge(userId: string, badge: BadgeKey) {
  const db = await getDB()
  const existing = await db.query.userBadgeTable.findFirst({
    where: and(eq(userBadgeTable.userId, userId), eq(userBadgeTable.badgeKey, badge)),
    columns: { id: true }
  })
  if (existing) return

  await db.insert(userBadgeTable).values({
    userId,
    badgeKey: badge,
    awardedAt: new Date()
  })

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
    columns: { email: true, emailVerified: true, notificationsEnabled: true }
  })

  if (user?.email && user.emailVerified && user.notificationsEnabled) {
    const { html, text } = renderNewBadgeEmail({
      badgeName: BADGE_DEFINITIONS[badge].name,
      badgeDescription: BADGE_DEFINITIONS[badge].description,
      badgeIcon: BADGE_DEFINITIONS[badge].icon
    })

    await sendEmail({
      to: user.email,
      subject: '🏅 Congratulations, you\'ve earned a new badge!',
      html,
      text
    })
  }
}

export type UserBadgeWithMeta = {
  key: BadgeKey
  name: string
  description: string
  icon: string
  awardedAt: Date
}

export async function getUserBadges(userId: string): Promise<UserBadgeWithMeta[]> {
  const db = await getDB()
  const rows = await db.query.userBadgeTable.findMany({
    where: eq(userBadgeTable.userId, userId)
  })
  return rows.map(r => ({
    key: r.badgeKey as BadgeKey,
    name: BADGE_DEFINITIONS[r.badgeKey as BadgeKey].name,
    description: BADGE_DEFINITIONS[r.badgeKey as BadgeKey].description,
    icon: BADGE_DEFINITIONS[r.badgeKey as BadgeKey].icon,
    awardedAt: r.awardedAt
  }))
}
