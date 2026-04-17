import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import type { CuratedSite, SiteCategory } from '@/db/schema'
import { curatedSites, siteCategories } from '@/db/schema'

export type { CuratedSite, SiteCategory } from '@/db/schema'

export type CuratedSiteWithTags = Omit<CuratedSite, 'tags'> & {
  tags: string[] | null
}

function parseTags(site: CuratedSite): CuratedSiteWithTags {
  return {
    ...site,
    tags: site.tags ? (JSON.parse(site.tags) as string[]) : null,
  }
}

export async function getSites(
  category?: string
): Promise<CuratedSiteWithTags[]> {
  const rows = await db
    .select()
    .from(curatedSites)
    .where(
      and(
        eq(curatedSites.visible, true),
        category ? eq(curatedSites.category, category) : undefined
      )
    )
    .orderBy(asc(curatedSites.order), asc(curatedSites.id))
  return rows.map(parseTags)
}

export function getCategories(): Promise<SiteCategory[]> {
  return db
    .select()
    .from(siteCategories)
    .orderBy(asc(siteCategories.order), asc(siteCategories.id))
}

export async function getCategoryById(
  id: number
): Promise<SiteCategory | undefined> {
  const rows = await db
    .select()
    .from(siteCategories)
    .where(eq(siteCategories.id, id))
  return rows[0]
}
