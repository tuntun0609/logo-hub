'use server'

import { asc, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { authors } from '@/db/schema'
import type { AuthorWithParsed } from '../authors'

function parseAuthor(author: typeof authors.$inferSelect): AuthorWithParsed {
  return {
    ...author,
    specialty: author.specialty
      ? (JSON.parse(author.specialty) as string[])
      : [],
    featuredWorks: author.featuredWorks
      ? (JSON.parse(author.featuredWorks) as { title: string; url: string }[])
      : [],
  }
}

export async function getAllAuthors(): Promise<AuthorWithParsed[]> {
  const rows = await db
    .select()
    .from(authors)
    .orderBy(asc(authors.order), asc(authors.id))
  return rows.map(parseAuthor)
}

interface AuthorInput {
  avatar?: string
  bio?: string
  featured: boolean
  featuredWorks?: { title: string; url: string }[]
  name: string
  order?: number
  specialty?: string[]
  visible: boolean
  websiteUrl?: string
}

export async function createAuthor(data: AuthorInput) {
  await db.insert(authors).values({
    name: data.name,
    avatar: data.avatar || null,
    bio: data.bio || null,
    specialty: data.specialty?.length ? JSON.stringify(data.specialty) : null,
    websiteUrl: data.websiteUrl || null,
    featuredWorks: data.featuredWorks?.length
      ? JSON.stringify(data.featuredWorks)
      : null,
    visible: data.visible,
    featured: data.featured,
    order: data.order ?? null,
  })
  revalidatePath('/authors')
  revalidatePath('/admin/authors')
}

export async function updateAuthor(id: number, data: AuthorInput) {
  await db
    .update(authors)
    .set({
      name: data.name,
      avatar: data.avatar || null,
      bio: data.bio || null,
      specialty: data.specialty?.length ? JSON.stringify(data.specialty) : null,
      websiteUrl: data.websiteUrl || null,
      featuredWorks: data.featuredWorks?.length
        ? JSON.stringify(data.featuredWorks)
        : null,
      visible: data.visible,
      featured: data.featured,
      order: data.order ?? null,
    })
    .where(eq(authors.id, id))
  revalidatePath('/authors')
  revalidatePath('/admin/authors')
}

export async function deleteAuthor(id: number) {
  await db.delete(authors).where(eq(authors.id, id))
  revalidatePath('/authors')
  revalidatePath('/admin/authors')
}

export async function toggleAuthorVisibility(id: number, visible: boolean) {
  await db.update(authors).set({ visible: !visible }).where(eq(authors.id, id))
  revalidatePath('/authors')
  revalidatePath('/admin/authors')
}

export async function toggleAuthorFeatured(id: number, featured: boolean) {
  await db
    .update(authors)
    .set({ featured: !featured })
    .where(eq(authors.id, id))
  revalidatePath('/authors')
  revalidatePath('/admin/authors')
}

export async function seedAuthors(
  items: Array<{
    avatar?: string
    bio?: string
    featured?: boolean
    featuredWorks?: { title: string; url: string }[]
    name: string
    specialty?: string[]
    websiteUrl?: string
  }>
): Promise<{ inserted: number; skipped: string[] }> {
  const seen = new Set<string>()
  const deduped = items.filter((a) => {
    if (seen.has(a.name)) {
      return false
    }
    seen.add(a.name)
    return true
  })

  const names = deduped.map((a) => a.name)
  const existingRows = await db
    .select({ name: authors.name })
    .from(authors)
    .where(inArray(authors.name, names))
  const existingNames = new Set(existingRows.map((r) => r.name))

  const toInsert = deduped.filter((a) => !existingNames.has(a.name))
  const skipped = deduped
    .filter((a) => existingNames.has(a.name))
    .map((a) => a.name)

  const intraBatchSkipped = items
    .filter((a, i) => {
      const first = items.findIndex((x) => x.name === a.name)
      return first !== i
    })
    .map((a) => a.name)
    .filter((n, i, arr) => arr.indexOf(n) === i)

  if (toInsert.length > 0) {
    await db.insert(authors).values(
      toInsert.map((a) => ({
        name: a.name,
        avatar: a.avatar || null,
        bio: a.bio || null,
        specialty: a.specialty?.length ? JSON.stringify(a.specialty) : null,
        websiteUrl: a.websiteUrl || null,
        featuredWorks: a.featuredWorks?.length
          ? JSON.stringify(a.featuredWorks)
          : null,
        visible: true,
        featured: a.featured ?? false,
      }))
    )
    revalidatePath('/authors')
    revalidatePath('/admin/authors')
  }

  return {
    inserted: toInsert.length,
    skipped: [...skipped, ...intraBatchSkipped].filter(
      (n, i, arr) => arr.indexOf(n) === i
    ),
  }
}
