import { getSessionFromCookie } from '@/utils/auth'
import { consumeCredits } from '@/utils/credits'
import { jsonResponse } from '@/utils/api'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { amount, description } = (await req.json()) as {
    amount: number
    description?: string
  }

  if (!amount || amount <= 0) {
    return new Response('Invalid amount', { status: 400 })
  }

  try {
    const remaining = await consumeCredits({
      userId: session.user.id,
      amount,
      description: description || 'Credit usage',
    })
    return jsonResponse({ success: true, remaining })
  } catch {
    return jsonResponse({ success: false, error: 'Insufficient credits' }, { status: 402 })
  }
}
