import { consumeCredits, addCredits } from '@/utils/credits'
import type { DatabaseContext } from './enrich-request'

interface FinalizeOptions {
  env: DatabaseContext
  requestId: string
  submissionId: string
  winnerUserId: string
  requestOwnerId: string
  offeredCredits: number
  extraRewardCredits: number
}

export async function finalizeRequest({
  env,
  requestId,
  submissionId,
  winnerUserId,
  requestOwnerId,
  offeredCredits,
  extraRewardCredits,
}: FinalizeOptions) {
  await env.DB.prepare('UPDATE request_submissions SET is_approved = CASE WHEN id = ?1 THEN 1 ELSE 0 END WHERE request_id = ?2')
    .bind(submissionId, requestId)
    .run()
  await env.DB.prepare('UPDATE requests SET status = ?1, accepted_user_id = ?2 WHERE id = ?3')
    .bind('fulfilled', winnerUserId, requestId)
    .run()

  const totalReward = offeredCredits + extraRewardCredits
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
    console.warn('Nem sikerült levonni a krediteket', err)
  }

  try {
    await addCredits({
      userId: winnerUserId,
      amount: totalReward,
      description: rewardDescription,
    })
  } catch (err) {
    console.warn('Nem sikerült jóváírni a jutalmat', err)
  }
}
