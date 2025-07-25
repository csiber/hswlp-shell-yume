import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDB } from '@/db'
import { userTable, CREDIT_TRANSACTION_TYPE } from '@/db/schema'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { FREE_MONTHLY_CREDITS, BADGE_DEFINITIONS } from '@/constants'
import { awardBadge } from '@/utils/badges'
import { lt, isNull, or, eq } from 'drizzle-orm'

// Ütemezett Worker, amely havonta kreditet ad a kevésbé aktív felhasználóknak

export const onScheduled = async () => {
  getCloudflareContext()
  const db = await getDB()

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

  await checkBadges(db)
}

async function checkBadges(db: any) {
  // Hot Dropper - 3 trending posts in the last week (>=5 likes)
  const hotRows = await db.execute(
    `SELECT user_id FROM (
       SELECT u.user_id, COUNT(*) AS cnt
         FROM uploads u
         JOIN favorites f ON u.id = f.upload_id AND f.created_at >= datetime('now','-7 day')
        WHERE u.created_at >= datetime('now','-7 day')
          AND u.visibility = 'public' AND u.approved = 1
        GROUP BY u.id
        HAVING COUNT(f.id) >= 5
     ) t GROUP BY user_id HAVING cnt >= 3`
  ).all()
  for (const row of hotRows.results || []) {
    await awardBadge(row.user_id, 'hot_dropper')
  }

  // Fan Favorite - any post with 20+ likes
  const fanRows = await db.execute(
    `SELECT u.user_id FROM uploads u JOIN favorites f ON u.id = f.upload_id GROUP BY u.id HAVING COUNT(f.id) >= 20`
  ).all()
  for (const row of fanRows.results || []) {
    await awardBadge(row.user_id, 'fan_favorite')
  }

  // Visual Artist - 100 uploads total
  const visualRows = await db.execute(
    `SELECT user_id FROM uploads GROUP BY user_id HAVING COUNT(*) >= 100`
  ).all()
  for (const row of visualRows.results || []) {
    await awardBadge(row.user_id, 'visual_artist')
  }

  // Master Commentator - comments received 100 reactions
  const commentRows = await db.execute(
    `SELECT c.user_id FROM comments c JOIN comment_reactions r ON r.comment_id = c.id GROUP BY c.user_id HAVING COUNT(r.id) >= 100`
  ).all()
  for (const row of commentRows.results || []) {
    await awardBadge(row.user_id, 'master_commentator')
  }

  // Spender - spent 1000 points (credits)
  const spendRows = await db.execute(
    `SELECT user_id, SUM(-amount) as spent FROM credit_transaction WHERE amount < 0 GROUP BY user_id HAVING SUM(-amount) >= 1000`
  ).all()
  for (const row of spendRows.results || []) {
    await awardBadge(row.user_id, 'spender')
  }
}
