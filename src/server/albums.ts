import 'server-only'
import { getDB } from '@/db'
import { createId } from '@paralleldrive/cuid2'

export async function createAlbum(userId: string, name: string, fileIds: string[]) {
  const db = await getDB()
  const id = `alb_${createId()}`
  await db.prepare('INSERT INTO albums (id, name, user_id, cover_file_id) VALUES (?1, ?2, ?3, ?4)')
    .bind(id, name, userId, fileIds[0])
    .run()
  for (const fileId of fileIds) {
    await db.prepare('UPDATE uploads SET album_id = ?1 WHERE id = ?2 AND user_id = ?3')
      .bind(id, fileId, userId)
      .run()
  }
  return id
}

export async function getAlbum(albumId: string) {
  const db = await getDB()
  const album = await db.prepare('SELECT id, name, user_id, created_at, cover_file_id FROM albums WHERE id = ?1')
    .bind(albumId)
    .first<Record<string, unknown>>()
  if (!album) return null
  const files = await db.prepare('SELECT id, title, mime, url, r2_key FROM uploads WHERE album_id = ?1 ORDER BY created_at')
    .bind(albumId)
    .all<Record<string, unknown>>()
  return { ...album, files: files.results || [] }
}

export async function listUserAlbums(userId: string) {
  const db = await getDB()
  return db.prepare('SELECT id, name, created_at, cover_file_id FROM albums WHERE user_id = ?1 ORDER BY created_at DESC')
    .bind(userId)
    .all<Record<string, unknown>>()
}
