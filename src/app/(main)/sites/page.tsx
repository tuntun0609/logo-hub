export const dynamic = 'force-dynamic'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SiteCard } from '@/components/site-card'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.98))] p-6 sm:p-8">
        <Badge className="rounded-full px-3 py-1 text-xs" variant="secondary">
          P0 主骨架 · 网站导航
        </Badge>
        <div className="mt-5">
          <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            优秀 Logo / 品牌 / 灵感网站导航
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            先建立分类浏览、简介说明和外部跳转入口，让首页与详情页都有可回流的导航资源。
          </p>
        </div>
      </section>

      <div className="space-y-10">
        {categories.map((cat) => {
          const sites = sitesByCategory.get(cat.name) ?? []
          if (sites.length === 0) {
            return null
          }

          const hasMore = sites.length > PREVIEW_LIMIT
          const preview = hasMore ? sites.slice(0, PREVIEW_LIMIT) : sites
          const categoryHref = `/sites/${encodeURIComponent(cat.name)}`

          return (
            <section className="space-y-4" key={cat.id}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{cat.name}</h2>
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {preview.map((site, index) => (
                  <SiteCard
                    imageLoading={index === 0 ? 'eager' : undefined}
                    key={site.id}
                    site={site}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="pt-1">
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-muted-foreground text-sm transition hover:border-foreground/20 hover:text-foreground"
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
