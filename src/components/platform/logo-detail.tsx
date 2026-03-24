'use client'

import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Download,
  ExternalLink,
  Search,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { curatedSites, toolGroups } from '@/data/platform'

type BrandLogo = Doc<'brand_logos'>

function pickRelatedTools(logo: BrandLogo) {
  const keywords = [logo.category, ...(logo.tags ?? [])].filter(Boolean)

  const matched = toolGroups
    .flatMap((group) => group.tools)
    .filter((tool) =>
      keywords.some((keyword) =>
        [tool.category, tool.name, tool.description, ...(tool.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(String(keyword).toLowerCase())
      )
    )

  return (
    matched.length > 0 ? matched : toolGroups.flatMap((group) => group.tools)
  ).slice(0, 4)
}

function pickRelatedSites(logo: BrandLogo) {
  const keywords = [logo.category, ...(logo.tags ?? [])].filter(Boolean)

  const matched = curatedSites.filter((site) =>
    keywords.some((keyword) =>
      [site.category, site.description, site.notes, ...site.tags]
        .join(' ')
        .toLowerCase()
        .includes(String(keyword).toLowerCase())
    )
  )

  return (matched.length > 0 ? matched : curatedSites).slice(0, 3)
}

async function downloadLogo(logo: BrandLogo) {
  try {
    const assetUrl = logo.logoSvgUrl || logo.logoUrl
    const response = await fetch(assetUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${logo.name}${logo.logoSvgUrl ? '.svg' : '.png'}`
    anchor.click()
    URL.revokeObjectURL(url)
  } catch {
    window.open(
      logo.logoSvgUrl || logo.logoUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)]">
        <Skeleton className="min-h-[28rem] rounded-[2rem]" />
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed p-10 text-center">
      <p className="font-medium text-lg">没有找到这个 Logo 案例</p>
      <p className="mt-2 text-muted-foreground text-sm">
        可能已被移除，或者你可以返回列表继续浏览其他案例。
      </p>
      <div className="mt-5 flex justify-center">
        <Link className="inline-flex items-center gap-2 text-sm" href="/logos">
          <ArrowLeft className="size-4" />
          返回案例列表
        </Link>
      </div>
    </div>
  )
}

export function LogoDetail({ id }: { id: string }) {
  const logo = useQuery(api.brandLogos.get, {
    id: id as Id<'brand_logos'>,
  })
  const allLogos = useQuery(api.brandLogos.listVisible, {})

  if (logo === undefined || allLogos === undefined) {
    return <LoadingState />
  }

  if (!logo?.visible) {
    return <EmptyState />
  }

  const relatedTools = pickRelatedTools(logo)
  const relatedSites = pickRelatedSites(logo)
  const similarLogos = allLogos
    .filter((item) => item._id !== logo._id)
    .filter(
      (item) =>
        item.category === logo.category ||
        item.tags?.some((tag) => logo.tags?.includes(tag))
    )
    .slice(0, 4)

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
        <Link className="transition hover:text-foreground" href="/">
          首页
        </Link>
        <span>/</span>
        <Link className="transition hover:text-foreground" href="/logos">
          Logo 案例
        </Link>
        <span>/</span>
        <span className="text-foreground">{logo.name}</span>
      </nav>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.76fr)]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_56%)] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{logo.category || '未分类'}</Badge>
                  {(logo.tags ?? []).slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div>
                  <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
                    {logo.name}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
                    {logo.description ||
                      '当前已补齐详情骨架，可继续承载品牌介绍、风格拆解、应用场景与相关推荐。'}
                  </p>
                </div>
              </div>
              {logo.brandColor && (
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-muted-foreground text-xs">品牌主色</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className="size-10 rounded-full border border-black/10"
                      style={{ backgroundColor: logo.brandColor }}
                    />
                    <span className="font-medium text-sm">
                      {logo.brandColor}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex min-h-[22rem] items-center justify-center rounded-[1.5rem] border border-border/60 bg-background/80 p-8">
              <img
                alt={logo.name}
                className="max-h-[20rem] w-full object-contain"
                draggable={false}
                height={420}
                src={logo.logoUrl}
                width={420}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border p-5">
              <h2 className="font-medium text-lg">相关工具</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                从案例直接进入配色、矢量化与导出工作流。
              </p>
              <div className="mt-4 space-y-3">
                {relatedTools.map((tool) =>
                  tool.isExternal ? (
                    <a
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 p-4 transition hover:border-foreground/15"
                      href={tool.href}
                      key={tool.name}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="mt-1 text-muted-foreground text-sm">
                          {tool.description}
                        </p>
                      </div>
                      <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    </a>
                  ) : (
                    <Link
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 p-4 transition hover:border-foreground/15"
                      href={tool.href}
                      key={tool.name}
                    >
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="mt-1 text-muted-foreground text-sm">
                          {tool.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border p-5">
              <h2 className="font-medium text-lg">继续浏览</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                让详情页承担回流作用，继续串联站内内容网络。
              </p>
              <div className="mt-4 space-y-3">
                {relatedSites.map((site) => (
                  <a
                    className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 p-4 transition hover:border-foreground/15"
                    href={site.href}
                    key={site.name}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div>
                      <p className="font-medium text-sm">{site.name}</p>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {site.description}
                      </p>
                    </div>
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border p-5">
            <h2 className="font-medium text-lg">案例信息</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">行业</span>
                <span>{logo.category || '未标注'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">风格标签</span>
                <span>
                  {logo.tags?.length ? `${logo.tags.length} 个` : '暂无'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">资源类型</span>
                <span>{logo.logoSvgUrl ? 'SVG + 位图' : '位图'}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {logo.website && (
                <Button
                  onClick={() =>
                    window.open(logo.website, '_blank', 'noopener,noreferrer')
                  }
                  variant="outline"
                >
                  <ExternalLink />
                  访问官网
                </Button>
              )}
              <Button onClick={() => downloadLogo(logo)}>
                <Download />
                下载资源
              </Button>
              <Button
                onClick={() => window.location.assign('/search?type=logo')}
                variant="secondary"
              >
                <Search />
                继续搜索
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border p-5">
            <h2 className="font-medium text-lg">主骨架下一步</h2>
            <div className="mt-4 space-y-3">
              {[
                {
                  icon: Wrench,
                  label: '工具串联',
                  text: '把配色提取、SVG 优化和导出工具挂到详情页。',
                },
                {
                  icon: Compass,
                  label: '导航回流',
                  text: '补充案例相关的灵感网站与专题入口。',
                },
                {
                  icon: ArrowRight,
                  label: '相关推荐',
                  text: '基于行业、风格和标签继续拓展浏览链路。',
                },
              ].map((item) => (
                <div
                  className="rounded-2xl border border-border/60 p-4"
                  key={item.label}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="size-4 text-primary" />
                    <p className="font-medium text-sm">{item.label}</p>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-xl">相似案例</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              基于行业与标签做第一版相关推荐回流。
            </p>
          </div>
          <Link
            className="text-muted-foreground text-sm transition hover:text-foreground"
            href="/logos"
          >
            返回列表
          </Link>
        </div>

        {similarLogos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {similarLogos.map((item) => (
              <Link
                className="rounded-[1.5rem] border p-4 transition hover:-translate-y-1 hover:border-foreground/15"
                href={`/logos/${item._id}`}
                key={item._id}
              >
                <div className="flex aspect-[4/3] items-center justify-center rounded-[1.25rem] bg-muted/50 p-4">
                  <img
                    alt={item.name}
                    className="h-full w-full object-contain"
                    height={160}
                    src={item.logoUrl}
                    width={160}
                  />
                </div>
                <div className="mt-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {item.category || '未分类'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed p-8 text-center text-muted-foreground text-sm">
            当前数据里还没有足够的相似案例，后续可以接专题推荐与分类聚合页。
          </div>
        )}
      </section>
    </div>
  )
}
