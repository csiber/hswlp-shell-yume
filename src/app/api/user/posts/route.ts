import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionFromCookie } from '@/utils/auth';
import { jsonResponse } from '@/utils/api';
import { getDb } from '@/lib/getDb';

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session?.user?.id) {
    return jsonResponse({ posts: [] }, { status: 401 });
  }

  const { env } = getCloudflareContext();
  const db = getDb(env, 'posts');
  const rows = await db.prepare(
    'SELECT id, content, created_at FROM posts WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 25'
  )
    .bind(session.user.id)
    .all<{ id: string; content: string; created_at: string }>();

  const posts = (rows.results || []).map((row) => ({
    id: row.id,
    content: row.content,
    created_at: new Date(row.created_at).toISOString(),
  }));

  return jsonResponse({ posts });
}
