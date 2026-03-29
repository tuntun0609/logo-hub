export const dynamic = 'force-dynamic'

import { ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { CuratedSiteWithTags } from '@/lib/actions/sites'
import { getCategories, getSites } from '@/lib/actions/sites'

const PREVIEW_LIMIT = 10

function SiteCard({ site }: { site: CuratedSiteWithTags }) {
  return (
    <a
      className="group flex flex-col gap-2 rounded-2xl border border-border/70 p-4 transition hover:-translate-y-0.5 hover:border-foreground/15"
      href={site.href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-snug">{site.name}</p>
        <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      </div>
      <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
        {site.description}
      </p>
      {site.notes && (
        <p className="truncate text-muted-foreground/70 text-xs italic">
          {site.notes}
        </p>
      )}
      {site.tags && site.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {site.tags.slice(0, 3).map((tag) => (
            <Badge className="text-[11px]" key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </a>
  )
}

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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {preview.map((site) => (
                  <SiteCard key={site.id} site={site} />
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
