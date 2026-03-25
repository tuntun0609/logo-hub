'use client'

import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function withCategory(category?: string) {
  return category ? `/sites?category=${encodeURIComponent(category)}` : '/sites'
}

function SitesPageSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 rounded-[2rem]" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton className="h-9 w-20 rounded-full" key={i} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-48 rounded-[1.75rem]" key={i} />
        ))}
      </div>
    </div>
  )
}

export default function SitesPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? '全部'

  const sites = useQuery(api.curatedSites.listVisible)

  if (sites === undefined) {
    return <SitesPageSkeleton />
  }

  const categories = ['全部', ...new Set(sites.map((site) => site.category))]

  const filteredSites =
    category === '全部'
      ? sites
      : sites.filter((site) => site.category === category)

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.98))] p-6 sm:p-8">
        <Badge className="rounded-full px-3 py-1 text-xs" variant="secondary">
          P0 主骨架 · 网站导航
        </Badge>
        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
              优秀 Logo / 品牌 / 灵感网站导航
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
              先建立分类浏览、简介说明和外部跳转入口，让首页与详情页都有可回流的导航资源。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: '分类浏览', value: `${categories.length - 1} 个分类` },
              { label: '收录站点', value: `${sites.length} 个站点` },
              { label: '推荐方式', value: '支持首页与详情页回流' },
              { label: '管理方式', value: '后台动态录入' },
            ].map((item) => (
              <div
                className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4"
                key={item.label}
              >
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="mt-2 font-medium text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Link
            className={
              item === category
                ? 'rounded-full border border-primary bg-primary px-4 py-2 text-primary-foreground text-sm'
                : 'rounded-full border px-4 py-2 text-muted-foreground text-sm transition hover:text-foreground'
            }
            href={withCategory(item === '全部' ? undefined : item)}
            key={item}
          >
            {item}
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSites.map((site) => (
          <a
            className="group rounded-[1.75rem] border border-border/70 p-5 transition hover:-translate-y-1 hover:border-foreground/15"
            href={site.href}
            key={site._id}
            rel="noreferrer"
            target="_blank"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge variant="secondary">{site.category}</Badge>
              <ExternalLink className="size-4 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-medium text-xl">{site.name}</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              {site.description}
            </p>
            <p className="mt-4 text-sm">{site.notes}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {site.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm">
              <span>前往站点</span>
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </div>
          </a>
        ))}
      </section>
    </div>
  )
}
