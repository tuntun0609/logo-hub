import {
  ArrowRight,
  Compass,
  GalleryVerticalEnd,
  Search,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  authorHighlights,
  curatedSites,
  logoSpotlights,
  platformIdeas,
  toolGroups,
  topicHighlights,
} from '@/data/platform'

const primaryButtonClassName =
  'inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-5 text-primary-foreground text-sm font-medium transition hover:bg-primary/90'

const outlineButtonClassName =
  'inline-flex h-9 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium transition hover:bg-muted hover:text-foreground'

const primaryModules = [
  {
    title: '案例库',
    description: '浏览 Logo 案例、标签、行业与相似内容，形成参考基线。',
    href: '/logos',
    icon: GalleryVerticalEnd,
  },
  {
    title: '工具库',
    description: '快速进入生成、配色、矢量化、导出等高频工作流。',
    href: '/tools',
    icon: Wrench,
  },
  {
    title: '网站导航',
    description: '收录值得长期回访的 Logo、品牌、字体与灵感网站。',
    href: '/sites',
    icon: Compass,
  },
]

const journeySteps = [
  '获取灵感',
  '浏览案例',
  '选择工具',
  '形成方案',
  '持续回访',
]

export default function HomePage() {
  const featuredTools = toolGroups.flatMap((group) => group.tools).slice(0, 4)

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.05),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          <div className="space-y-6">
            <Badge
              className="rounded-full px-3 py-1 text-xs"
              variant="secondary"
            >
              P0 主骨架 · 平台首页
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-semibold text-4xl tracking-tight sm:text-5xl">
                把 Logo Hub 从单点工具，拉成完整的
                <span className="text-primary"> 工具 + 内容 + 资源库 </span>
                平台
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                首页先承担平台定位、模块分发和内容推荐：用户进入后能立刻理解价值，并顺着案例、工具、网站导航与搜索链路继续浏览。
              </p>
            </div>

            <form action="/search" className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 pr-4 pl-11 text-sm outline-none transition focus:border-primary"
                  defaultValue=""
                  name="q"
                  placeholder="搜索案例、工具、网站、作者、方案"
                  type="search"
                />
              </div>
              <button className={primaryButtonClassName} type="submit">
                统一搜索
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link className={primaryButtonClassName} href="/logos">
                进入案例库
              </Link>
              <Link className={outlineButtonClassName} href="/tools">
                查看工具库
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              {journeySteps.map((step, index) => (
                <div
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                  key={step}
                >
                  <p className="text-muted-foreground text-xs">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 font-medium text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 self-start">
            {[
              {
                title: '热门工具',
                value: '配色提取 / SVG 优化 / 尺寸导出',
              },
              {
                title: '精选案例',
                value: '先补齐详情页，再承接相关推荐与 SEO。',
              },
              {
                title: '最新收录',
                value: '首页直接挂出最近新增的导航和案例入口。',
              },
              {
                title: '专题入口',
                value: '先放专题占位，为后续 P1 内容网络铺路。',
              },
            ].map((item) => (
              <div
                className="rounded-[1.75rem] border border-border/60 bg-background/80 p-5"
                key={item.title}
              >
                <p className="text-muted-foreground text-xs">{item.title}</p>
                <p className="mt-2 font-medium text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {primaryModules.map((module) => (
          <Link
            className="group rounded-[2rem] border border-border/70 bg-card/80 p-6 transition hover:-translate-y-1 hover:border-foreground/15"
            href={module.href}
            key={module.title}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <module.icon className="size-5" />
            </div>
            <h2 className="mt-6 font-semibold text-2xl">{module.title}</h2>
            <p className="mt-2 text-muted-foreground text-sm leading-6">
              {module.description}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <span>进入模块</span>
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[2rem] border p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold text-2xl">推荐内容</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                先用首页把 P0 的主入口和推荐位建立起来。
              </p>
            </div>
            <Link
              className="text-muted-foreground text-sm transition hover:text-foreground"
              href="/search"
            >
              查看全部
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {logoSpotlights.map((item) => (
              <Link
                className="rounded-[1.5rem] border border-border/60 p-5 transition hover:border-foreground/15"
                href={item.href}
                key={item.name}
              >
                <Badge variant="secondary">{item.category}</Badge>
                <h3 className="mt-4 font-medium text-lg">{item.name}</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border p-6">
            <h2 className="font-semibold text-xl">热门工具</h2>
            <div className="mt-4 space-y-3">
              {featuredTools.map((tool) => (
                <Link
                  className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/60 p-4 transition hover:border-foreground/15"
                  href={tool.href}
                  key={tool.name}
                  target={tool.isExternal ? '_blank' : undefined}
                >
                  <div>
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border p-6">
            <h2 className="font-semibold text-xl">内容网络占位</h2>
            <div className="mt-4 grid gap-3">
              {[
                ...platformIdeas,
                ...topicHighlights.slice(0, 1),
                ...authorHighlights.slice(0, 1),
              ]
                .slice(0, 4)
                .map((item) => (
                  <Link
                    className="rounded-[1.25rem] border border-border/60 p-4 transition hover:border-foreground/15"
                    href={item.href}
                    key={'title' in item ? item.title : item.name}
                  >
                    <p className="font-medium text-sm">
                      {'title' in item ? item.title : item.name}
                    </p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-2xl">导航预览</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              网站导航页先补分类浏览、简介说明与外部跳转。
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
          {curatedSites.slice(0, 4).map((site) => (
            <a
              className="rounded-[1.5rem] border border-border/60 p-5 transition hover:-translate-y-1 hover:border-foreground/15"
              href={site.href}
              key={site.name}
              rel="noreferrer"
              target="_blank"
            >
              <Badge variant="outline">{site.category}</Badge>
              <h3 className="mt-4 font-medium text-lg">{site.name}</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                {site.description}
              </p>
              <p className="mt-3 text-sm">{site.notes}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
