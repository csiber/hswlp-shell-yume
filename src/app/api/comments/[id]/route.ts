import { requireAdmin } from '@/utils/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { jsonResponse } from '@/utils/api';
import { getDb } from '@/lib/getDb';

interface RouteContext<T> { params: Promise<T> }

export async function DELETE(_req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin();
  const { env } = getCloudflareContext();
  const db = getDb(env, 'comment_reactions');
  const dbComments = getDb(env, 'comments');
  const { id } = await params;
  await db.prepare('DELETE FROM comment_reactions WHERE comment_id = ?1').bind(id).run();
  await dbComments.prepare('DELETE FROM comments WHERE id = ?1').bind(id).run();
  return jsonResponse({ success: true });
}
