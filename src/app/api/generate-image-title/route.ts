import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof Blob)) {
    return jsonResponse({ success: false, error: 'File required' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  let title: string | null = null

  if (env.IMAGE_CAPTION_URL && env.IMAGE_CAPTION_KEY) {
    try {
      const fd = new FormData()
      fd.append('image', file, 'img')
      const res = await fetch(env.IMAGE_CAPTION_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.IMAGE_CAPTION_KEY}` },
        body: fd,
      })
      if (res.ok) {
        const data = (await res.json()) as { caption?: string; title?: string }
        title = data.caption || data.title || null
      }
    } catch (err) {
      console.warn('Caption API failed', err)
    }
  }

  if (!title) {
    title = `Image-${randomUUID().slice(0, 8)}`
  }

  return jsonResponse({ success: true, title })
}
