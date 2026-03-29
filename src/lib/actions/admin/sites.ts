'use server'

import { asc, eq } from 'drizzle-orm'
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
) {
  await db.insert(curatedSites).values(
    sites.map((s) => ({
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
