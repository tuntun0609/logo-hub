'use server'

import { asc, eq } from 'drizzle-orm'
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
