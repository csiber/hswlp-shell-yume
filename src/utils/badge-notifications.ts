export type BadgeNotificationPreferences = {
  email: string | null
  emailVerified: Date | number | string | null
  emailNotificationsEnabled: number | boolean | null
}

export function canSendBadgeEmailNotification(
  user: BadgeNotificationPreferences | null | undefined
): user is BadgeNotificationPreferences & { email: string } {
  if (!user) return false
  if (!user.email) return false
  if (!user.emailVerified) return false
  return Boolean(user.emailNotificationsEnabled)
}
