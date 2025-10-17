'use server'

import { createServerAction, ZSAError } from 'zsa'
import { z } from 'zod'
import { getSessionFromCookie } from '@/utils/auth'
import { getDB } from '@/db'
import { highlightCollectionsTable, ROLES_ENUM } from '@/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

const DEFAULT_HIGHLIGHT_COLLECTION_ID = 'hlc_marketplace_default'

function parseOptionalDate(value: string | null | undefined) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

async function ensureAdmin() {
  const session = await getSessionFromCookie()

  if (!session || session.user.role !== ROLES_ENUM.ADMIN) {
    throw new ZSAError('NOT_AUTHORIZED', 'Nincs jogosultság ehhez a művelethez')
  }

  return session
}

const baseCollectionSchema = z.object({
  title: z.string().min(1, 'Adj meg címet'),
  slug: z.string().min(1, 'Adj meg slug-ot'),
  description: z.string().optional(),
  activeFrom: z.string().optional().nullable(),
  activeTo: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
})

export const createHighlightCollectionAction = createServerAction()
  .input(baseCollectionSchema)
  .handler(async ({ input }) => {
    await ensureAdmin()
    const db = await getDB()

    const slug = input.slug.trim().toLowerCase()
    const existing = await db.query.highlightCollectionsTable.findFirst({
      where: eq(highlightCollectionsTable.slug, slug),
    })

    if (existing) {
      throw new ZSAError('CONFLICT', 'Már létezik ilyen slug')
    }

    if (input.isDefault) {
      await db
        .update(highlightCollectionsTable)
        .set({ isDefault: 0 })
        .where(eq(highlightCollectionsTable.isDefault, 1))
    }

    const id = `hlc_${createId()}`

    await db.insert(highlightCollectionsTable).values({
      id,
      slug,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      activeFrom: parseOptionalDate(input.activeFrom),
      activeTo: parseOptionalDate(input.activeTo),
      isActive: input.isActive === false ? 0 : 1,
      isDefault: input.isDefault ? 1 : 0,
      displayOrder: input.displayOrder ?? 0,
    })

    return { success: true, id }
  })

export const updateHighlightCollectionAction = createServerAction()
  .input(
    baseCollectionSchema.extend({
      id: z.string().min(1),
    }),
  )
  .handler(async ({ input }) => {
    await ensureAdmin()
    const db = await getDB()

    const slug = input.slug.trim().toLowerCase()
    const otherWithSlug = await db.query.highlightCollectionsTable.findFirst({
      where: and(
        eq(highlightCollectionsTable.slug, slug),
        ne(highlightCollectionsTable.id, input.id),
      ),
    })

    if (otherWithSlug) {
      throw new ZSAError('CONFLICT', 'Ezzel a slug-gal már létezik másik kollekció')
    }

    if (input.isDefault) {
      await db
        .update(highlightCollectionsTable)
        .set({ isDefault: 0 })
        .where(and(eq(highlightCollectionsTable.isDefault, 1), ne(highlightCollectionsTable.id, input.id)))
    }

    await db
      .update(highlightCollectionsTable)
      .set({
        slug,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        activeFrom: parseOptionalDate(input.activeFrom),
        activeTo: parseOptionalDate(input.activeTo),
        isActive: input.isActive === false ? 0 : 1,
        isDefault: input.isDefault ? 1 : 0,
        displayOrder: input.displayOrder ?? 0,
      })
      .where(eq(highlightCollectionsTable.id, input.id))

    return { success: true }
  })

export const deleteHighlightCollectionAction = createServerAction()
  .input(z.object({ id: z.string().min(1) }))
  .handler(async ({ input }) => {
    await ensureAdmin()
    const db = await getDB()

    if (input.id === DEFAULT_HIGHLIGHT_COLLECTION_ID) {
      throw new ZSAError('FORBIDDEN', 'Az alapértelmezett kollekció nem törölhető')
    }

    await db.delete(highlightCollectionsTable).where(eq(highlightCollectionsTable.id, input.id))

    return { success: true }
  })
