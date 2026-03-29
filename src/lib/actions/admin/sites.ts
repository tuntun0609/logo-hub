'use server'

import { asc, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { curatedSites } from '@/db/schema'
import type { CuratedSiteWithTags } from '../sites'

export async function getAllSites(): Promise<CuratedSiteWithTags[]> {
  const rows = await db
    .select()
    .from(curatedSites)
    .orderBy(asc(curatedSites.order), asc(curatedSites.id))
  return rows.map((s) => ({
    ...s,
    tags: s.tags ? (JSON.parse(s.tags) as string[]) : null,
  }))
}

interface SiteInput {
  category: string
  description: string
  href: string
  name: string
  notes?: string
  order?: number
  tags?: string[]
  visible: boolean
}

export async function createSite(data: SiteInput) {
  const existing = await db
    .select({ id: curatedSites.id })
    .from(curatedSites)
    .where(eq(curatedSites.name, data.name))
    .limit(1)
  if (existing.length > 0) {
    throw new Error('duplicate_name')
  }
  await db.insert(curatedSites).values({
    name: data.name,
    description: data.description,
    href: data.href,
    category: data.category,
    notes: data.notes ?? null,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    order: data.order ?? null,
    visible: data.visible,
  })
  revalidatePath('/sites')
  revalidatePath('/admin/sites')
}

export async function updateSite(id: number, data: SiteInput) {
  const existing = await db
    .select({ id: curatedSites.id })
    .from(curatedSites)
    .where(eq(curatedSites.name, data.name))
    .limit(1)
  if (existing.length > 0 && existing[0].id !== id) {
    throw new Error('duplicate_name')
  }
  await db
    .update(curatedSites)
    .set({
      name: data.name,
      description: data.description,
      href: data.href,
      category: data.category,
      notes: data.notes ?? null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      order: data.order ?? null,
      visible: data.visible,
    })
    .where(eq(curatedSites.id, id))
  revalidatePath('/sites')
  revalidatePath('/admin/sites')
}

export async function deleteSite(id: number) {
  await db.delete(curatedSites).where(eq(curatedSites.id, id))
  revalidatePath('/sites')
  revalidatePath('/admin/sites')
}

export async function toggleSiteVisibility(id: number, visible: boolean) {
  await db
    .update(curatedSites)
    .set({ visible: !visible })
    .where(eq(curatedSites.id, id))
  revalidatePath('/sites')
  revalidatePath('/admin/sites')
}

export async function seedSites(
  sites: Array<{
    category: string
    description: string
    href: string
    name: string
    notes?: string
    tags?: string[]
  }>
): Promise<{ inserted: number; skipped: string[] }> {
  // Deduplicate input by name (keep first occurrence)
  const seen = new Set<string>()
  const deduped = sites.filter((s) => {
    if (seen.has(s.name)) {
      return false
    }
    seen.add(s.name)
    return true
  })

  // Find names that already exist in DB
  const names = deduped.map((s) => s.name)
  const existingRows = await db
    .select({ name: curatedSites.name })
    .from(curatedSites)
    .where(inArray(curatedSites.name, names))
  const existingNames = new Set(existingRows.map((r) => r.name))

  const toInsert = deduped.filter((s) => !existingNames.has(s.name))
  const skipped = deduped
    .filter((s) => existingNames.has(s.name))
    .map((s) => s.name)

  // Also collect intra-batch duplicates that were filtered out
  const intraBatchSkipped = sites
    .filter((s, i) => {
      const first = sites.findIndex((x) => x.name === s.name)
      return first !== i
    })
    .map((s) => s.name)
    .filter((n, i, arr) => arr.indexOf(n) === i)

  if (toInsert.length > 0) {
    await db.insert(curatedSites).values(
      toInsert.map((s) => ({
        name: s.name,
        description: s.description,
        href: s.href,
        category: s.category,
        notes: s.notes ?? null,
        tags: s.tags ? JSON.stringify(s.tags) : null,
        visible: true,
      }))
    )
    revalidatePath('/sites')
    revalidatePath('/admin/sites')
  }

  return {
    inserted: toInsert.length,
    skipped: [...skipped, ...intraBatchSkipped].filter(
      (n, i, arr) => arr.indexOf(n) === i
    ),
  }
}
