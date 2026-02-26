import { consumeCredits, addCredits } from '@/utils/credits'
import type { DatabaseContext } from './enrich-request'
import { getD1Changes } from '@/utils/d1-result'

interface FinalizeOptions {
  env: DatabaseContext
  requestId: string
  submissionId: string
  winnerUserId: string
  requestOwnerId: string
  offeredCredits: number
  extraRewardCredits: number
  currentStatus: string
}

export async function finalizeRequest({
  env,
  requestId,
  submissionId,
  winnerUserId,
  requestOwnerId,
  offeredCredits,
  extraRewardCredits,
  currentStatus,
}: FinalizeOptions) {
  const lockResult = await env.DB.prepare(
    'UPDATE requests SET status = ?1 WHERE id = ?2 AND status = ?3 AND status != ?4 AND status != ?5'
  ).bind('finalizing', requestId, currentStatus, 'finalizing', 'fulfilled').run()

  if (getD1Changes(lockResult) !== 1) {
    return { finalized: false, reason: 'stale-status' as const }
  }

  const totalReward = Math.floor(offeredCredits + extraRewardCredits)
  if (!Number.isFinite(totalReward) || totalReward <= 0) {
    await env.DB.prepare('UPDATE requests SET status = ?1 WHERE id = ?2 AND status = ?3')
      .bind(currentStatus, requestId, 'finalizing')
      .run()
    throw new Error('Invalid reward amount')
  }

  const rewardDescription = extraRewardCredits > 0
    ? `Request reward (extra +${extraRewardCredits})`
    : 'Request reward'

  try {
    await consumeCredits({
      userId: requestOwnerId,
      amount: totalReward,
      description: 'Request payment',
    })
  } catch (err) {
    await env.DB.prepare('UPDATE requests SET status = ?1 WHERE id = ?2 AND status = ?3')
      .bind(currentStatus, requestId, 'finalizing')
      .run()
    console.warn('Nem sikerült levonni a krediteket', err)
    throw err
  }

  try {
    await addCredits({
      userId: winnerUserId,
      amount: totalReward,
      description: rewardDescription,
    })
  } catch (err) {
    try {
      await addCredits({
        userId: requestOwnerId,
        amount: totalReward,
        description: 'Request payment rollback',
      })
    } catch (rollbackError) {
      console.error('Rollback credit restore failed', rollbackError)
    }
    await env.DB.prepare('UPDATE requests SET status = ?1 WHERE id = ?2 AND status = ?3')
      .bind(currentStatus, requestId, 'finalizing')
      .run()
    console.warn('Nem sikerült jóváírni a jutalmat', err)
    throw err
  }

  await env.DB.prepare('UPDATE request_submissions SET is_approved = CASE WHEN id = ?1 THEN 1 ELSE 0 END WHERE request_id = ?2')
    .bind(submissionId, requestId)
    .run()

  const finalizeResult = await env.DB.prepare(
    'UPDATE requests SET status = ?1, accepted_user_id = ?2 WHERE id = ?3 AND status = ?4'
  ).bind('fulfilled', winnerUserId, requestId, 'finalizing').run()

  if (getD1Changes(finalizeResult) !== 1) {
    throw new Error('Failed to finalize request state')
  }

  return { finalized: true as const }
}
