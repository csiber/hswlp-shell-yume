import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { sendEmail } from '@/utils/email'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { env } = getCloudflareContext()
  const form = await req.formData()
  const email = form.get('email')
  const description = form.get('description')
  const file = form.get('file') as File | null

  if (typeof email !== 'string' || typeof description !== 'string') {
    return jsonResponse({ success: false, error: 'Missing fields' }, { status: 400 })
  }

  let fileUrl: string | null = null
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() || 'png'
    const key = `bug-reports/${uuidv4()}.${ext}`
    try {
      await env.yumekai_r2.put(key, file)
      fileUrl = await getSignedUrl(env.yumekai_r2, key)
    } catch (err) {
      console.error('Bug report upload failed', err)
    }
  }

  const html = `<!DOCTYPE html><html><body>
    <p><strong>Beküldő:</strong> ${email}</p>
    <p>${description.replace(/\n/g, '<br/>')}</p>
    ${fileUrl ? `<p>Kép: <a href="${fileUrl}">${fileUrl}</a></p>` : ''}
  </body></html>`
  const text = `Beküldő: ${email}\n\n${description}${fileUrl ? `\nKép: ${fileUrl}` : ''}`

  try {
    await sendEmail({
      to: 'info@hswlp.com',
      subject: 'Új hibajelentés',
      html,
      text,
    })
  } catch (err) {
    console.error('Failed to send bug report email', err)
    return jsonResponse({ success: false, error: 'Email error' }, { status: 500 })
  }

  return jsonResponse({ success: true })
}
