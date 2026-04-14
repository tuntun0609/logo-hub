import {
  ArrowRight,
  Eraser,
  FileImage,
  Palette,
  Search,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { SiteCard } from '@/components/site-card'
import { allTools } from '@/data/platform'
import { getSites } from '@/lib/actions/sites'

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

export default async function HomePage() {
  const [featuredSites] = await Promise.all([getSites()])

  return (
    <div className="space-y-16">
      {/* Hero — 简洁大气，单一焦点 */}
      <section className="pt-4 sm:pt-8 lg:pt-12">
        <div className="max-w-3xl space-y-6">
          <h1 className="font-semibold text-3xl leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
            图片与 Logo 的在线工具箱
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            免费在线工具，覆盖图标生成、格式转换、抠图、配色提取等高频场景。
          </p>
          <form action="/search" className="flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-lg border bg-background pr-4 pl-10 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:ring-1 focus:ring-foreground/10"
                defaultValue=""
                name="q"
                placeholder="搜索工具，例如：SVG、抠图、配色"
                type="search"
              />
            </div>
            <button
              className="h-10 shrink-0 rounded-lg bg-foreground px-4 font-medium text-background text-sm transition hover:bg-foreground/90"
              type="submit"
            >
              搜索
            </button>
          </form>
        </div>
      </section>

      {/* 快捷工具入口 — 横向排列，视觉突出 */}
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

      {/* 全部工具 — 紧凑网格 */}
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

      {/* 精选网站 — 无外框，直接展示 */}
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredSites.slice(0, 4).map((site, index) => (
            <SiteCard
              imageLoading={index === 0 ? 'eager' : undefined}
              key={site.id}
              site={site}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
