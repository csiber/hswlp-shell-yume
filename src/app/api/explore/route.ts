import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { getSignedUrl } from '@/utils/r2'
import { NextRequest } from 'next/server'
interface BucketLike {
  createSignedUrl?: (options: { method: string; key: string; expiresIn: number }) =>
    | Promise<string | URL>
    | string
    | URL
}

function hasSignedUrl(value: unknown): value is BucketLike {
  return typeof value === 'object' && value !== null && 'createSignedUrl' in value
}

type RawRow = Record<string, string | number | null>

const DEFAULT_HIGHLIGHT_LIMIT = 6
const DEFAULT_COLLECTION_LIMIT = 20

function toIso(value: unknown) {
  if (value === null || value === undefined) {
    return null
  }
  const date = new Date(value as string | number)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

function parsePositiveInt(value: string | null, fallback: number, { min = 1, max }: { min?: number; max?: number } = {}) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (Number.isNaN(parsed) || parsed < min) {
    return fallback
  }
  if (typeof max === 'number' && parsed > max) {
    return max
  }
  return parsed
}

interface ExploreResponseItem {
  id: string
  title: string | null
  url: string
  created_at: string | number | null
  author: string
  is_nsfw: boolean
  [key: string]: unknown
}

async function buildItem(
  row: RawRow,
  env: { yumekai_r2?: unknown },
  base: string | null,
): Promise<ExploreResponseItem> {
  let url = (row.url as string) || ''
  const r2Key = row.r2_key as string | null | undefined

  if (r2Key) {
    if (base) {
      url = `${base}${r2Key}`
    }
    else if (hasSignedUrl(env.yumekai_r2)) {
      url = await getSignedUrl(env.yumekai_r2, r2Key)
    }
  }

  const rawId = row.upload_id ?? row.id

  return {
    id: rawId ? String(rawId) : '',
    title: (row.title as string | null) ?? null,
    url,
    created_at: row.created_at,
    author: (row.nickname as string | null) || (row.email as string | null) || '',
    is_nsfw: false,
  }
}

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext()
  const { searchParams } = new URL(req.url)

  const page = parsePositiveInt(searchParams.get('page'), 1, { min: 1 })
  const limit = parsePositiveInt(searchParams.get('limit'), 20, { min: 10, max: 50 })
  const offset = (page - 1) * limit

  const adminMode = searchParams.get('admin') === '1'
  const statusFilter = searchParams.get('status') ?? (adminMode ? 'all' : 'active')
  const includeItems = searchParams.get('includeItems') !== '0'
  const highlightLimit = parsePositiveInt(searchParams.get('highlightLimit'), DEFAULT_HIGHLIGHT_LIMIT, {
    min: 1,
    max: 50,
  })
  const collectionIdFilter = searchParams.get('collectionId')
  const searchFilter = searchParams.get('search')
  const collectionPage = parsePositiveInt(searchParams.get('collectionPage'), 1, { min: 1 })
  const collectionLimit = parsePositiveInt(
    searchParams.get('collectionLimit'),
    adminMode ? DEFAULT_COLLECTION_LIMIT : 100,
    { min: 1, max: 200 },
  )
  const collectionOffset = (collectionPage - 1) * collectionLimit

  const publicBase = process.env.R2_PUBLIC_BASE_URL
  const base = publicBase
    ? publicBase.endsWith('/')
      ? publicBase
      : `${publicBase}/`
    : null

  const collectionConditions: string[] = []
  const collectionBindings: Array<string | number> = []

  if (!adminMode || statusFilter === 'active') {
    collectionConditions.push('hc.is_active = 1')
    collectionConditions.push('(hc.active_from IS NULL OR hc.active_from <= CURRENT_TIMESTAMP)')
    collectionConditions.push('(hc.active_to IS NULL OR hc.active_to >= CURRENT_TIMESTAMP)')
  } else if (statusFilter === 'upcoming') {
    collectionConditions.push('hc.is_active = 1')
    collectionConditions.push('hc.active_from IS NOT NULL')
    collectionConditions.push('hc.active_from > CURRENT_TIMESTAMP')
  } else if (statusFilter === 'expired') {
    collectionConditions.push('hc.active_to IS NOT NULL')
    collectionConditions.push('hc.active_to < CURRENT_TIMESTAMP')
  } else if (statusFilter === 'inactive') {
    collectionConditions.push('hc.is_active = 0')
  }

  if (collectionIdFilter) {
    collectionConditions.push('hc.id = ?')
    collectionBindings.push(collectionIdFilter)
  }

  if (searchFilter) {
    collectionConditions.push('(hc.title LIKE ? OR hc.slug LIKE ?)')
    const like = `%${searchFilter}%`
    collectionBindings.push(like, like)
  }

  const collectionWhere = collectionConditions.length ? `WHERE ${collectionConditions.join(' AND ')}` : ''

  const collectionsSql = `
    SELECT
      hc.id,
      hc.slug,
      hc.title,
      hc.description,
      hc.active_from,
      hc.active_to,
      hc.is_active,
      hc.is_default,
      hc.display_order,
      hc.created_at,
      hc.updated_at
    FROM highlight_collections hc
    ${collectionWhere}
    ORDER BY hc.display_order ASC, hc.created_at DESC
    ${adminMode ? 'LIMIT ? OFFSET ?' : ''}
  `

  const collectionsBindingsWithPaging = adminMode
    ? [...collectionBindings, collectionLimit, collectionOffset]
    : [...collectionBindings]

  const collectionResult = await env.DB
    .prepare(collectionsSql)
    .bind(...collectionsBindingsWithPaging)
    .all<RawRow>()

  let totalCollections: number | undefined
  if (adminMode) {
    const countSql = `
      SELECT COUNT(*) as total
      FROM highlight_collections hc
      ${collectionWhere}
    `
    const countRow = await env.DB.prepare(countSql).bind(...collectionBindings).first<{ total: number }>()
    totalCollections = Number(countRow?.total ?? 0)
  }

  const collections = collectionResult.results ?? []

  let highlightSections: Array<Record<string, unknown>> = []

  if (includeItems && collections.length) {
    const collectionIds = collections.map(row => row.id as string)
    const placeholders = collectionIds.map(() => '?').join(', ')
    const highlightConditions: string[] = [
      `hp.collection_id IN (${placeholders})`,
      "u.visibility = 'public'",
      'u.approved = 1',
      "u.moderation_status = 'approved'",
      "u.type = 'image'",
    ]

    if (!adminMode || statusFilter === 'active') {
      highlightConditions.push('(hp.display_from IS NULL OR hp.display_from <= CURRENT_TIMESTAMP)')
      highlightConditions.push('(hp.display_to IS NULL OR hp.display_to >= CURRENT_TIMESTAMP)')
      highlightConditions.push('hp.expires_at >= CURRENT_TIMESTAMP')
    }

    const highlightsSql = `
      SELECT
        hp.id AS highlight_id,
        hp.collection_id,
        hp.description AS highlight_description,
        hp.display_from,
        hp.display_to,
        hp.expires_at,
        u.id AS upload_id,
        u.title,
        u.url,
        u.r2_key,
        u.created_at,
        usr.nickname,
        usr.email
      FROM highlighted_posts hp
      JOIN uploads u ON hp.post_id = u.id
      JOIN user usr ON u.user_id = usr.id
      WHERE ${highlightConditions.join(' AND ')}
      ORDER BY hp.display_from IS NULL, hp.display_from ASC, hp.display_to ASC, u.created_at DESC
    `

    const highlightRows = await env.DB
      .prepare(highlightsSql)
      .bind(...collectionIds)
      .all<RawRow>()

    const grouped = new Map<string, RawRow[]>()
    for (const row of highlightRows.results ?? []) {
      const key = row.collection_id as string
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(row)
    }

    highlightSections = await Promise.all(
      collections.map(async (collection) => {
        const itemsForCollection = grouped.get(collection.id as string) ?? []
        const mappedItems = await Promise.all(
          itemsForCollection.slice(0, highlightLimit).map(async (row) => {
            const item = await buildItem(row, env, base)
            return {
              ...item,
              highlight: {
                id: row.highlight_id,
                description: row.highlight_description,
                displayFrom: toIso(row.display_from),
                displayTo: toIso(row.display_to ?? row.expires_at),
              },
            }
          }),
        )

        return {
          id: collection.id,
          slug: collection.slug,
          title: collection.title,
          description: collection.description,
          isActive: collection.is_active === 1,
          isDefault: collection.is_default === 1,
          displayOrder: collection.display_order,
          activeFrom: toIso(collection.active_from),
          activeTo: toIso(collection.active_to),
          items: mappedItems,
        }
      }),
    )
  }

  const feedResult = await env.DB.prepare(`
      SELECT u.id AS upload_id, u.title, u.url, u.r2_key, u.created_at,
             usr.nickname, usr.email
        FROM uploads u
        JOIN user usr ON u.user_id = usr.id
       WHERE u.visibility = 'public'
         AND u.approved = 1
         AND u.moderation_status = 'approved'
         AND u.type = 'image'
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?
    `).bind(limit, offset).all<RawRow>()

  const feedItems = await Promise.all(
    (feedResult.results ?? []).map(row => buildItem(row, env, base)),
  )

  const feedHasMore = (feedResult.results?.length ?? 0) === limit

  return jsonResponse({
    sections: highlightSections,
    feed: {
      items: feedItems,
      page,
      limit,
      hasMore: feedHasMore,
    },
    admin: adminMode
      ? {
          status: statusFilter,
          page: collectionPage,
          limit: collectionLimit,
          total: totalCollections ?? 0,
        }
      : undefined,
  })
}
