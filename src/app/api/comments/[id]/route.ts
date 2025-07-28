import { getSessionFromCookie } from '@/utils/auth';
import { ROLES_ENUM } from '@/db/schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { jsonResponse } from '@/utils/api';

interface RouteContext<T> { params: Promise<T> }

export async function PATCH(req: Request, { params }: RouteContext<{ id: string }>) {
  const { env } = getCloudflareContext();
  const { id } = await params;
  const session = await getSessionFromCookie();
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 });
  }
  const owner = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?1')
    .bind(id)
    .first<{ user_id: string }>();
  if (!owner) {
    return jsonResponse({ success: false }, { status: 404 });
  }
  if (owner.user_id !== session.user.id && session.user.role !== ROLES_ENUM.ADMIN) {
    return jsonResponse({ success: false }, { status: 403 });
  }
  const { text } = (await req.json()) as { text?: string };
  if (!text || !text.trim() || text.length > 500) {
    return jsonResponse({ success: false }, { status: 400 });
  }
  await env.DB.prepare('UPDATE comments SET content = ?2 WHERE id = ?1')
    .bind(id, text.trim())
    .run();
  return jsonResponse({ success: true, comment: { id, text: text.trim() } });
}

export async function DELETE(req: Request, { params }: RouteContext<{ id: string }>) {
  const { env } = getCloudflareContext();
  const { id } = await params;
  const session = await getSessionFromCookie();
  const owner = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?1')
    .bind(id)
    .first<{ user_id: string }>();
  if (!owner) {
    return jsonResponse({ success: false }, { status: 404 });
  }
  if (!session?.user?.id) {
    return jsonResponse({ success: false }, { status: 401 });
  }
  if (owner.user_id !== session.user.id && session.user.role !== ROLES_ENUM.ADMIN) {
    return jsonResponse({ success: false }, { status: 403 });
  }
  await env.DB.prepare('DELETE FROM comment_reactions WHERE comment_id = ?1').bind(id).run();
  await env.DB.prepare('DELETE FROM comments WHERE id = ?1').bind(id).run();
  return jsonResponse({ success: true });
}
