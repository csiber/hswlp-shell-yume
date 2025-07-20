import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDb } from '@/lib/getDb'

export class WebhookService {
  static async dispatch(user_id: string, event: string, payload: unknown) {
    const { env } = getCloudflareContext()
    const db = getDb(env, 'webhooks')
    const result = await db.prepare(
      'SELECT url FROM webhooks WHERE user_id = ?1 AND enabled = 1'
    ).bind(user_id).first<{ url: string }>()

    if (!result?.url) return

    try {
      await fetch(result.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload })
      })
    } catch (e) {
      console.warn('Webhook hiba:', e)
    }
  }
}
