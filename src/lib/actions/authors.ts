import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import type { Author } from '@/db/schema'
import { authors } from '@/db/schema'

export type { Author } from '@/db/schema'

export interface AuthorWithParsed
  extends Omit<Author, 'featuredWorks' | 'specialty'> {
  featuredWorks: { title: string; url: string }[]
  specialty: string[]
}

function parseAuthor(author: Author): AuthorWithParsed {
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

export async function getVisibleAuthors(): Promise<AuthorWithParsed[]> {
  const rows = await db
    .select()
    .from(authors)
    .where(eq(authors.visible, true))
    .orderBy(desc(authors.featured), asc(authors.order), asc(authors.id))
  return rows.map(parseAuthor)
}

export async function getAuthorById(
  id: number
): Promise<AuthorWithParsed | null> {
  const rows = await db
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1)
  if (rows.length === 0 || !rows[0].visible) {
    return null
  }
  return parseAuthor(rows[0])
}
