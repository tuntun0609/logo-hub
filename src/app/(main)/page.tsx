import { ArrowRight, Eraser, Palette, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { SiteCard } from '@/components/site-card'
import { allTools } from '@/data/platform'
import { getSites } from '@/lib/actions/sites'

const primaryButtonClassName =
  'inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-5 text-primary-foreground text-sm font-medium transition hover:bg-primary/90'

const outlineButtonClassName =
  'inline-flex h-9 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium transition hover:bg-muted hover:text-foreground'

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
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.05),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-4xl font-semibold text-4xl tracking-tight sm:text-5xl">
                Logo Hub — 图片与 Logo 的
                <span className="text-primary"> 在线工具箱</span>
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                免费在线工具，覆盖图标生成、格式转换、抠图、配色提取等高频场景。
              </p>
            </div>

            <form action="/search" className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 pr-4 pl-11 text-sm outline-none transition focus:border-primary"
                  defaultValue=""
                  name="q"
                  placeholder="搜索工具，例如：SVG、抠图、配色"
                  type="search"
                />
              </div>
              <button className={primaryButtonClassName} type="submit">
                统一搜索
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link className={primaryButtonClassName} href="/tools">
                查看工具库
              </Link>
              <Link className={outlineButtonClassName} href="/sites">
                浏览网站导航
              </Link>
            </div>
          </div>

          <div className="grid gap-3 self-start">
            {heroTools.map((tool) => (
              <Link
                className="flex items-center gap-4 rounded-[1.75rem] border border-border/60 bg-background/80 p-5 transition hover:border-foreground/15"
                href={tool.href}
                key={tool.title}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <tool.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{tool.title}</p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-2xl">全部工具</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              共 {allTools.length} 个在线工具
            </p>
          </div>
          <Link
            className="text-muted-foreground text-sm transition hover:text-foreground"
            href="/tools"
          >
            查看工具库
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allTools.map((tool) => (
            <Link
              className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
              href={tool.href}
              key={tool.name}
            >
              <p className="font-medium text-sm">{tool.name}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-2xl">精选网站导航</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              收录值得回访的 Logo、品牌与设计灵感网站
            </p>
          </div>
          <Link
            className="text-muted-foreground text-sm transition hover:text-foreground"
            href="/sites"
          >
            浏览网站导航
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
