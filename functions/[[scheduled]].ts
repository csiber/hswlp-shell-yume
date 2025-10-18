import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { D1Database } from '@cloudflare/workers-types'
import { getDB } from '@/db'
import {
  userTable,
  CREDIT_TRANSACTION_TYPE,
  creditWarningEmailTable,
  firstPostEmailTable,
} from '@/db/schema'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { FREE_MONTHLY_CREDITS, BADGE_DEFINITIONS } from '@/constants'
import { awardBadge } from '@/utils/badges'
import { lt, isNull, or, eq, and } from 'drizzle-orm'
import { renderCreditsLowWarningEmail } from '@/utils/credits-low-warning-email'
import { renderFirstPostEmail } from '@/utils/first-post-email'
import { renderActivationEmail, renderReturningEmail } from '@/utils/campaign-templates'
import { runCampaigns, type CampaignHandler, type CampaignMessage } from '@/utils/campaign-runner'

function requireD1Database(
  db: D1Database | undefined,
  context: string,
): D1Database {
  if (!db) {
    throw new Error(
      `A(z) ${context} futtatásához szükséges NEXT_TAG_CACHE_D1 D1-adatbázis nincs konfigurálva.`,
    )
  }

  return db
}

import { createId } from '@paralleldrive/cuid2'

// Scheduled worker that grants monthly credits to less active users

export const onScheduled = async () => {
  const { env } = await getCloudflareContext({ async: true })
  const db = await getDB()
  const rawDb = requireD1Database(env.NEXT_TAG_CACHE_D1, 'időzített feladat')

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

  // Iterate over eligible users and credit their accounts
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

  await checkBadges(rawDb)

  await runCampaigns(
    { db, env, now },
    [
      createActivationCampaign(),
      createReturningCampaign(),
      createLowCreditCampaign(),
      createFirstPostCampaign(),
    ],
  )
}

async function checkBadges(db: D1Database) {
  const toIdString = (value: unknown): string | null => {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'bigint') return value.toString()
    return null
  }
  const getRowValue = (row: unknown, key: string): unknown => {
    if (!row || typeof row !== 'object') return undefined
    if (!(key in row)) return undefined
    return (row as Record<string, unknown>)[key]
  }

  // Hot Dropper - 3 trending posts in the last week (>=5 likes)
  const hotRows = await db
    .prepare(`SELECT user_id FROM (
       SELECT u.user_id
         FROM uploads u
         JOIN favorites f ON u.id = f.upload_id AND f.created_at >= datetime('now','-7 day')
        WHERE u.created_at >= datetime('now','-7 day')
          AND u.visibility = 'public' AND u.approved = 1
        GROUP BY u.id
        HAVING COUNT(f.id) >= 5
     ) t GROUP BY user_id HAVING COUNT(*) >= 3`)
    .all()
  for (const row of hotRows.results ?? []) {
    const userId = toIdString(getRowValue(row, 'user_id'))
    if (!userId) continue
    await awardBadge(userId, 'hot_dropper')
  }

  // Fan Favorite - any post with 20+ likes
  const fanRows = await db
    .prepare(
      `SELECT u.user_id FROM uploads u JOIN favorites f ON u.id = f.upload_id GROUP BY u.id HAVING COUNT(f.id) >= 20`,
    )
    .all()
  for (const row of fanRows.results ?? []) {
    const userId = toIdString(getRowValue(row, 'user_id'))
    if (!userId) continue
    await awardBadge(userId, 'fan_favorite')
  }

  // Visual Artist - 100 uploads total
  const visualRows = await db
    .prepare(`SELECT user_id FROM uploads GROUP BY user_id HAVING COUNT(*) >= 100`)
    .all()
  for (const row of visualRows.results ?? []) {
    const userId = toIdString(getRowValue(row, 'user_id'))
    if (!userId) continue
    await awardBadge(userId, 'visual_artist')
  }

  // Master Commentator - comments received 100 reactions
  const commentRows = await db
    .prepare(
      `SELECT c.user_id FROM comments c JOIN comment_reactions r ON r.comment_id = c.id GROUP BY c.user_id HAVING COUNT(r.id) >= 100`,
    )
    .all()
  for (const row of commentRows.results ?? []) {
    const userId = toIdString(getRowValue(row, 'user_id'))
    if (!userId) continue
    await awardBadge(userId, 'master_commentator')
  }

  // Spender - spent 1000 points (credits)
  const spendRows = await db
    .prepare(
      `SELECT userId, SUM(-amount) as spent FROM credit_transaction WHERE amount < 0 GROUP BY userId HAVING SUM(-amount) >= 1000`,
    )
    .all()
  for (const row of spendRows.results ?? []) {
    const userId = toIdString(getRowValue(row, 'userId'))
    if (!userId) continue
    await awardBadge(userId, 'spender')
  }
}

function createLowCreditCampaign(): CampaignHandler {
  return {
    key: 'low_credit_warning',
    name: 'Alacsony kredit figyelmeztetés',
    triggerType: 'scheduled',
    eligibility: '0 kredit, 3 napnál régebbi inaktivitás, igazolt e-mail',
    throttleHours: 72,
    envFlag: 'ENABLE_LOW_CREDIT_CAMPAIGN',
    prepare: async ({ db, env, now }) => {
      const referenceNow = now ?? new Date()
      const threeDaysAgo = new Date(referenceNow.getTime() - 3 * 24 * 60 * 60 * 1000)
      const weekAgo = new Date(referenceNow.getTime() - 7 * 24 * 60 * 60 * 1000)

      const rawDb = requireD1Database(env.NEXT_TAG_CACHE_D1, 'alacsony kredit kampány')
      const result = await rawDb
        .prepare(`SELECT u.id, u.email, u.nickname, l.sent_at FROM user u
         LEFT JOIN credit_warning_email l ON l.user_id = u.id
         WHERE u.currentCredits = 0
           AND u.email IS NOT NULL
           AND u.emailVerified IS NOT NULL
           AND u.email_notifications_enabled = 1
           AND (u.last_login_at IS NULL OR u.last_login_at <= ?1)
           AND (l.sent_at IS NULL OR l.sent_at <= ?2)`)
        .bind(threeDaysAgo.toISOString(), weekAgo.toISOString())
        .all()

      const rows = (result.results ?? []) as {
        id: string
        email: string | null
        nickname: string | null
      }[]

      const messages: CampaignMessage[] = []

      for (const row of rows) {
        if (!row.email) continue

        const { html, text } = renderCreditsLowWarningEmail({
          userName: row.nickname || undefined,
        })

        messages.push({
          userId: row.id,
          email: row.email,
          subject: '🪙 Elfogytak a pontjaid – ne maradj le!',
          html,
          text,
          onSuccess: async () => {
            await db.insert(creditWarningEmailTable).values({
              id: `cwl_${createId()}`,
              userId: row.id,
              sentAt: new Date(),
            })
          },
        })
      }

      return messages
    },
  }
}

function createFirstPostCampaign(): CampaignHandler {
  return {
    key: 'first_post_celebration',
    name: 'Első poszt értesítés',
    triggerType: 'scheduled',
    eligibility: 'Első poszt beküldése után időzített emlékeztető',
    throttleHours: 24,
    envFlag: 'ENABLE_FIRST_POST_CAMPAIGN',
    prepare: async ({ db, env }) => {
      const rows = await db
        .select()
        .from(firstPostEmailTable)
        .leftJoin(userTable, eq(firstPostEmailTable.userId, userTable.id))
        .where(
          and(
            isNull(firstPostEmailTable.sentAt),
            lt(firstPostEmailTable.sendAfter, new Date()),
          ),
        )
        .all() as {
          first_post_email: { id: string; userId: string; postId: string }
          user: { email: string | null; nickname: string | null; emailVerified: number | null }
        }[]

      const messages: CampaignMessage[] = []

      for (const row of rows) {
        const email = row.user.email
        if (!email || !row.user.emailVerified) continue

        const likesRow = await requireD1Database(
          env.NEXT_TAG_CACHE_D1,
          'első poszt kampány',
        )
          .prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?1')
          .bind(row.first_post_email.postId)
          .first<{ c: number }>()

        const likeCount = likesRow?.c ?? 0
        const postUrl = `https://yumekai.com/post/${row.first_post_email.postId}`
        const { html, text } = renderFirstPostEmail({ postUrl, likeCount })

        messages.push({
          userId: row.first_post_email.userId,
          email,
          subject: '🎉 Az első Yumekai posztod él!',
          html,
          text,
          onSuccess: async () => {
            await db
              .update(firstPostEmailTable)
              .set({ sentAt: new Date() })
              .where(eq(firstPostEmailTable.id, row.first_post_email.id))
          },
        })
      }

      return messages
    },
  }
}

function createReturningCampaign(): CampaignHandler {
  return {
    key: 'returning_highlights',
    name: 'Visszatérő felhasználó kampány',
    triggerType: 'scheduled',
    eligibility: '7 napja nem jelentkezett be, e-mail értesítések engedélyezve',
    throttleHours: 168,
    envFlag: 'ENABLE_RETURNING_CAMPAIGN',
    prepare: async ({ env, now }) => {
      const referenceNow = now ?? new Date()
      const weekAgo = new Date(referenceNow.getTime() - 7 * 24 * 60 * 60 * 1000)

      const result = await requireD1Database(
        env.NEXT_TAG_CACHE_D1,
        'visszatérő kampány',
      )
        .prepare(`SELECT u.id, u.email, u.nickname FROM user u
         WHERE u.email IS NOT NULL
           AND u.emailVerified IS NOT NULL
           AND u.email_notifications_enabled = 1
           AND (u.last_login_at IS NULL OR u.last_login_at <= ?1)`)
        .bind(weekAgo.toISOString())
        .all()

      return ((result.results ?? []) as {
        id: string
        email: string | null
        nickname: string | null
      }[])
        .filter((row) => row.email)
        .map((row) => {
          const { html, text } = renderReturningEmail({
            userName: row.nickname || undefined,
            exploreUrl: 'https://yumekai.com/explore',
            highlightUrl: 'https://yumekai.com/explore?tab=top',
          })

          return {
            userId: row.id,
            email: row.email!,
            subject: '👀 Új inspirációk várnak a Yumekain',
            html,
            text,
          }
        })
    },
  }
}

function createActivationCampaign(): CampaignHandler {
  return {
    key: 'activation_welcome',
    name: 'Aktiváló kampány',
    triggerType: 'scheduled',
    eligibility: 'Friss regisztráció, nincs feltöltés és belépés',
    throttleHours: 48,
    envFlag: 'ENABLE_ACTIVATION_CAMPAIGN',
    prepare: async ({ env, now }) => {
      const referenceNow = now ?? new Date()
      const onboardingWindowEnd = new Date(referenceNow.getTime() - 6 * 60 * 60 * 1000)
      const onboardingWindowStart = new Date(
        referenceNow.getTime() - 14 * 24 * 60 * 60 * 1000,
      )

      const result = await requireD1Database(
        env.NEXT_TAG_CACHE_D1,
        'aktiváló kampány',
      )
        .prepare(`SELECT u.id, u.email, u.nickname
         FROM user u
         LEFT JOIN uploads up ON up.user_id = u.id
         WHERE u.email IS NOT NULL
           AND u.emailVerified IS NOT NULL
           AND u.email_notifications_enabled = 1
           AND u.createdAt >= ?1
           AND u.createdAt <= ?2
           AND (u.last_login_at IS NULL OR u.last_login_at <= ?2)
         GROUP BY u.id
         HAVING COUNT(up.id) = 0`)
        .bind(onboardingWindowStart.toISOString(), onboardingWindowEnd.toISOString())
        .all()

      return ((result.results ?? []) as {
        id: string
        email: string | null
        nickname: string | null
      }[])
        .filter((row) => row.email)
        .map((row) => {
          const { html, text } = renderActivationEmail({
            userName: row.nickname || undefined,
            gettingStartedUrl: 'https://yumekai.com/dashboard',
            communityUrl: 'https://yumekai.com/community-guidelines',
          })

          return {
            userId: row.id,
            email: row.email!,
            subject: '🚀 Indítsd el a Yumekai profilodat',
            html,
            text,
          }
        })
    },
  }
}
