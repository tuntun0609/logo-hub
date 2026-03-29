import { asc, eq } from 'drizzle-orm'
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
      category
        ? eq(curatedSites.category, category)
        : eq(curatedSites.visible, true)
    )
    .orderBy(asc(curatedSites.order), asc(curatedSites.id))
  return rows.filter((s) => s.visible).map(parseTags)
}

export function getCategories(): Promise<SiteCategory[]> {
  return db
    .select()
    .from(siteCategories)
    .orderBy(asc(siteCategories.order), asc(siteCategories.id))
}
