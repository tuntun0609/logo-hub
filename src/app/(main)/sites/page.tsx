export const dynamic = 'force-dynamic'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SiteCard } from '@/components/site-card'
import type { CuratedSiteWithTags } from '@/lib/actions/sites'
import { getCategories, getSites } from '@/lib/actions/sites'

const PREVIEW_LIMIT = 10

export default async function SitesPage() {
  const [categories, allSites] = await Promise.all([
    getCategories(),
    getSites(),
  ])

  const sitesByCategory = new Map<string, CuratedSiteWithTags[]>()
  for (const cat of categories) {
    sitesByCategory.set(cat.name, [])
  }
  for (const site of allSites) {
    const list = sitesByCategory.get(site.category)
    if (list) {
      list.push(site)
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">网站导航</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          收录优秀的 Logo、品牌与设计灵感网站，按分类浏览。
        </p>
      </div>

      <div className="space-y-14">
        {categories.map((cat) => {
          const sites = sitesByCategory.get(cat.name) ?? []
          if (sites.length === 0) {
            return null
          }

          const hasMore = sites.length > PREVIEW_LIMIT
          const preview = hasMore ? sites.slice(0, PREVIEW_LIMIT) : sites
          const categoryHref = `/sites/${encodeURIComponent(cat.name)}`

          return (
            <section className="space-y-5" key={cat.id}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold text-base">{cat.name}</h2>
                {hasMore && (
                  <Link
                    className="flex items-center gap-1 text-muted-foreground text-sm transition hover:text-foreground"
                    href={categoryHref}
                  >
                    查看全部
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {preview.map((site, index) => (
                  <SiteCard
                    imageLoading={index === 0 ? 'eager' : undefined}
                    key={site.id}
                    site={site}
                  />
                ))}
              </div>
              {hasMore && (
                <div>
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-muted-foreground text-sm transition hover:border-foreground/20 hover:text-foreground"
                    href={categoryHref}
                  >
                    查看「{cat.name}」全部网站
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
