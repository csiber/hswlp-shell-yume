import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/db/schema'
import { userTable, CREDIT_TRANSACTION_TYPE } from '@/db/schema'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { FREE_MONTHLY_CREDITS } from '@/constants'
import { lt, isNull, or, eq } from 'drizzle-orm'

// Ütemezett Worker, amely havonta kreditet ad a kevésbé aktív felhasználóknak

export const onScheduled: ExportedHandlerScheduledHandler<CloudflareEnv> = async (controller, env, ctx) => {
  const db = drizzle(env.DB_GLOBAL as D1Database, { schema })

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
      sourceApp: 'cron',
      source: 'cron',
    })
    await db
      .update(userTable)
      .set({ lastCreditRefreshAt: now })
      .where(eq(userTable.id, user.id))
  }
}
