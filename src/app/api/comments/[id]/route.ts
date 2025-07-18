import { requireAdmin } from '@/utils/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { jsonResponse } from '@/utils/api';

interface RouteContext<T> { params: Promise<T> }

export async function DELETE(_req: Request, { params }: RouteContext<{ id: string }>) {
  await requireAdmin();
  const { env } = getCloudflareContext();
  const { id } = await params;
  await env.DB.prepare('DELETE FROM comment_reactions WHERE comment_id = ?1').bind(id).run();
  await env.DB.prepare('DELETE FROM comments WHERE id = ?1').bind(id).run();
  return jsonResponse({ success: true });
}
