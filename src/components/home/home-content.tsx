'use client'

import { ArrowRight, Eraser, FileImage, Palette, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { HeroVisual } from '@/components/hero-visual'
import { SiteCard } from '@/components/site-card'
import { allTools } from '@/data/platform'
import { useSiteCategories, useSitesList } from '@/lib/query/hooks/use-sites'

const heroTools = [
  {
    title: 'Icon Maker',
    description: '生成 App 图标',
    href: '/tools/icon-maker',
    icon: Sparkles,
  },
  {
    title: 'Background Remover',
    description: 'AI 一键抠图',
    href: '/tools/background-remover',
    icon: Eraser,
  },
  {
    title: 'Color Extractor',
    description: '提取主题配色',
    href: '/tools/color-extractor',
    icon: Palette,
  },
]

const HOMEPAGE_CATEGORIES = 2
const HOMEPAGE_SITES_PER_CATEGORY = 3

export function HomeContent() {
  const { data: categories = [] } = useSiteCategories()
  const { data: allSites = [] } = useSitesList()

  const sitesByCategory = new Map<string, typeof allSites>()
  for (const site of allSites) {
    const list = sitesByCategory.get(site.category)
    if (list) {
      list.push(site)
    } else {
      sitesByCategory.set(site.category, [site])
    }
  }

  const featuredCategories = categories
    .filter((cat) => (sitesByCategory.get(cat.name)?.length ?? 0) > 0)
    .slice(0, HOMEPAGE_CATEGORIES)

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-2xl px-1 pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-20 lg:pb-14">
        <HeroVisual />
        <div className="relative z-10 max-w-2xl space-y-5">
          <h1 className="font-semibold text-3xl leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
            图片与 Logo 的
            <br className="sm:hidden" />
            <span className="relative inline-block">
              在线工具箱
              <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-foreground/20" />
            </span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            免费在线工具，覆盖图标生成、格式转换、抠图、配色提取等高频场景。
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-2.5 font-medium text-primary-foreground text-sm transition-all hover:bg-primary/80"
              href="/tools"
            >
              探索全部工具
              <ArrowRight className="size-4" />
            </Link>
            <span className="text-muted-foreground/60 text-sm">
              {allTools.length} 个工具 · 完全免费
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-lg">常用工具</h2>
          <Link
            className="text-muted-foreground text-sm transition hover:text-foreground"
            href="/tools"
          >
            查看全部
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {heroTools.map((tool) => (
            <Link
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
              href={tool.href}
              key={tool.title}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06] transition-colors group-hover:bg-foreground/[0.1]">
                <tool.icon className="size-[18px] text-foreground/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{tool.title}</p>
                <p className="mt-0.5 truncate text-muted-foreground text-xs">
                  {tool.description}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-semibold text-lg">全部工具</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              共 {allTools.length} 个在线工具
            </p>
          </div>
          <Link
            className="text-muted-foreground text-sm transition hover:text-foreground"
            href="/tools"
          >
            工具库
          </Link>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {allTools.map((tool) => (
            <Link
              className="group bg-background p-4 transition-colors hover:bg-muted/40"
              href={tool.href}
              key={tool.name}
            >
              <div className="flex items-center gap-3">
                <FileImage className="size-4 shrink-0 text-muted-foreground/50" />
                <p className="truncate font-medium text-sm">{tool.name}</p>
              </div>
              <p className="mt-1.5 line-clamp-1 pl-7 text-muted-foreground text-xs">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-semibold text-lg">精选网站导航</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              收录值得回访的 Logo、品牌与设计灵感网站
            </p>
          </div>
          <Link
            className="flex items-center gap-1 text-muted-foreground text-sm transition hover:text-foreground"
            href="/sites"
          >
            浏览全部
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="space-y-10">
          {featuredCategories.map((cat) => {
            const sites = (sitesByCategory.get(cat.name) ?? []).slice(
              0,
              HOMEPAGE_SITES_PER_CATEGORY
            )
            return (
              <div className="space-y-4" key={cat.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-medium text-muted-foreground text-sm">
                    {cat.name}
                  </h3>
                  <Link
                    className="flex items-center gap-1 text-muted-foreground/70 text-xs transition hover:text-foreground"
                    href={`/sites/${cat.id}`}
                  >
                    更多
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sites.map((site, index) => (
                    <SiteCard
                      imageLoading={index === 0 ? 'eager' : undefined}
                      key={site.id}
                      site={site}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
