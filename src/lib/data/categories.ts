import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import type { SiteCategory } from '@/db/schema'
import { siteCategories } from '@/db/schema'

export async function getAllCategories(): Promise<SiteCategory[]> {
  return await db
    .select()
    .from(siteCategories)
    .orderBy(asc(siteCategories.order), asc(siteCategories.id))
}

export async function createCategoryRecord(data: {
  name: string
  order?: number
}) {
  await db.insert(siteCategories).values({
    name: data.name,
    order: data.order ?? null,
  })
}

export async function updateCategoryRecord(
  id: number,
  data: { name: string; order?: number }
) {
  await db
    .update(siteCategories)
    .set({ name: data.name, order: data.order ?? null })
    .where(eq(siteCategories.id, id))
}

export async function deleteCategoryRecord(id: number) {
  await db.delete(siteCategories).where(eq(siteCategories.id, id))
}

export async function seedCategoriesRecord(
  categories: Array<{ name: string; order?: number }>
) {
  await db
    .insert(siteCategories)
    .values(categories.map((c) => ({ name: c.name, order: c.order ?? null })))
}
