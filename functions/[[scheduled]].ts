import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getGlobalDB } from '@/db'
import { userTable, CREDIT_TRANSACTION_TYPE } from '@/db/schema'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { FREE_MONTHLY_CREDITS } from '@/constants'
import { lt, isNull, or, eq } from 'drizzle-orm'

// Ütemezett Worker, amely havonta kreditet ad a kevésbé aktív felhasználóknak

export const onScheduled = async () => {
  getCloudflareContext()
  const db = await getGlobalDB()

  const now = new Date()
  const monthAgo = new Date(now)
  monthAgo.setMonth(monthAgo.getMonth() - 1)

  const users = await db.query.userTable.findMany({
    where: or(
      isNull(userTable.lastCreditRefreshAt),
      lt(userTable.lastCreditRefreshAt, monthAgo)
    ),
    columns: {
      id: true,
    },
  })

  // Végigmegyünk a jogosult felhasználókon és jóváírjuk a krediteket
  for (const user of users) {
    const expirationDate = new Date(now)
    expirationDate.setMonth(expirationDate.getMonth() + 1)

    await updateUserCredits(user.id, FREE_MONTHLY_CREDITS)
    await logTransaction({
      userId: user.id,
      amount: FREE_MONTHLY_CREDITS,
      description: 'Monthly bonus',
      type: CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH,
      expirationDate,
    })
    await db
      .update(userTable)
      .set({ lastCreditRefreshAt: now })
      .where(eq(userTable.id, user.id))
  }
}
