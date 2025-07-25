import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDB } from '@/db'
import {
  userTable,
  CREDIT_TRANSACTION_TYPE,
  creditWarningEmailTable,
  firstPostEmailTable,
  emailLogTable,
} from '@/db/schema'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { FREE_MONTHLY_CREDITS, BADGE_DEFINITIONS } from '@/constants'
import { awardBadge } from '@/utils/badges'
import { lt, isNull, or, eq, and } from 'drizzle-orm'
import { sendEmail } from '@/utils/email'
import { renderCreditsLowWarningEmail } from '@/utils/credits-low-warning-email'
import { renderFirstPostEmail } from '@/utils/first-post-email'
import { renderReengagementEmail } from '@/utils/reengagement-email'

import { createId } from '@paralleldrive/cuid2'

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
  await sendLowCreditWarnings(db)
  await sendFirstPostEmails(db)
  await sendReengagementEmails(db)
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

async function sendLowCreditWarnings(db: any) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db.execute(
    `SELECT u.id, u.email, u.nickname, l.sent_at FROM user u
     LEFT JOIN credit_warning_email l ON l.user_id = u.id
     WHERE u.currentCredits = 0
       AND u.emailVerified IS NOT NULL
       AND (u.last_login_at IS NULL OR u.last_login_at <= ?1)
       AND (l.sent_at IS NULL OR l.sent_at <= ?2)`
  ).bind(threeDaysAgo.toISOString(), weekAgo.toISOString()).all() as {
    results?: {
      id: string
      email: string
      nickname: string | null
      sent_at?: string
    }[]
  }

  for (const row of rows.results || []) {
    if (!row.email) continue

    const { html, text } = renderCreditsLowWarningEmail({
      userName: row.nickname || undefined
    })

    await sendEmail({
      to: row.email,
      subject: '🪙 You\'re out of points – don\'t miss out!',
      html,
      text
    })

    await db.insert(creditWarningEmailTable).values({
      id: `cwl_${createId()}`,
      userId: row.id,
      sentAt: new Date()
    })
  }
}


async function sendFirstPostEmails(db: any) {
  const rows = await db
    .select()
    .from(firstPostEmailTable)
    .leftJoin(userTable, eq(firstPostEmailTable.userId, userTable.id))
    .where(and(isNull(firstPostEmailTable.sentAt), lt(firstPostEmailTable.sendAfter, new Date())))
    .all() as {
      first_post_email: { id: string; userId: string; postId: string };
      user: { email: string | null; nickname: string | null; emailVerified: number | null };
    }[];

  for (const row of rows) {
    const email = row.user.email;
    if (!email || !row.user.emailVerified) continue;

    const likesRow = await db
      .execute('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?1')
      .bind(row.first_post_email.postId)
      .first() as { c: number } | undefined;

    const likeCount = likesRow?.c ?? 0;
    const postUrl = `https://yumekai.com/post/${row.first_post_email.postId}`;
    const { html, text } = renderFirstPostEmail({ postUrl, likeCount });

    await sendEmail({
      to: email,
      subject: '🎉 Your first Yumekai post is live!',
      html,
      text,
    });

      await db
        .update(firstPostEmailTable)
        .set({ sentAt: new Date() })
        .where(eq(firstPostEmailTable.id, row.first_post_email.id));

  }
}

async function sendReengagementEmails(db: any) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db.execute(
    `SELECT u.id, u.email, u.nickname, l.sent_at FROM user u
     LEFT JOIN email_log l ON l.user_id = u.id AND l.type = 'reengagement'
     WHERE u.email IS NOT NULL
       AND u.emailVerified IS NOT NULL
       AND u.email_notifications_enabled = 1
       AND (u.last_login_at IS NULL OR u.last_login_at <= ?1)
       AND (l.sent_at IS NULL OR l.sent_at <= ?2)`
  ).bind(weekAgo.toISOString(), weekAgo.toISOString()).all() as {
    results?: {
      id: string
      email: string
      nickname: string | null
      sent_at?: string
    }[]
  }

  for (const row of rows.results || []) {
    if (!row.email) continue

    const { html, text } = renderReengagementEmail({
      userName: row.nickname || undefined
    })

    await sendEmail({
      to: row.email,
      subject: '👀 Long time no see – new NSFW images await!',
      html,
      text
    })

    await db.insert(emailLogTable).values({
      id: `elog_${createId()}`,
      userId: row.id,
      type: 'reengagement',
      sentAt: new Date()
    })
  }
}
