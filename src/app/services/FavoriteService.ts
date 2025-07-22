import { v4 as uuidv4 } from 'uuid'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDb } from '@/utils/db'

export class FavoriteService {
  static async add(userId: string, uploadId: string) {
    const { env } = getCloudflareContext()
    const dbUser = getDb(env, 'DB_GLOBAL')
    await dbUser.prepare(
      'INSERT OR IGNORE INTO favorites (id, user_id, upload_id) VALUES (?1, ?2, ?3)'
    ).bind(`fav_${uuidv4()}`, userId, uploadId).run()
  }

  static async remove(userId: string, uploadId: string) {
    const { env } = getCloudflareContext()
    const dbUser = getDb(env, 'DB_GLOBAL')
    await dbUser.prepare(
      'DELETE FROM favorites WHERE user_id = ?1 AND upload_id = ?2'
    ).bind(userId, uploadId).run()
  }
}
