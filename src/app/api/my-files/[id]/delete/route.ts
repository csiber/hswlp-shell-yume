// src/app/api/my-files/[id]/delete/route.ts

import { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/utils/auth'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDb } from '@/lib/getDb'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: NextRequest, { params }: any) {
  const session = await getSessionFromCookie()
  const { env } = getCloudflareContext()
  const dbUploads = getDb(env, 'uploads')
  const dbDeletions = getDb(env, 'deletions')

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const file = await dbUploads.prepare(
    'SELECT r2_key FROM uploads WHERE id = ?1 AND user_id = ?2'
  ).bind(params.id, session.user.id).first<{ r2_key: string }>()

  if (!file) {
    return new Response('Not found', { status: 404 })
  }

  await env.yumekai_r2.delete(file.r2_key)

  await dbDeletions.prepare(
    'INSERT INTO deletions (user_id, upload_id, deleted_at) VALUES (?1, ?2, CURRENT_TIMESTAMP)'
  ).bind(session.user.id, params.id).run()

  await dbUploads.prepare(
    'DELETE FROM uploads WHERE id = ?1 AND user_id = ?2'
  ).bind(params.id, session.user.id).run()

  return Response.json({ success: true })
}
