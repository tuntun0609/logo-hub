'use client'

import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { usePaginatedQuery } from 'convex/react'
import {
  ArrowRight,
  Compass,
  LayoutGrid,
  ScanSearch,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type BrandLogo = Doc<'brand_logos'>

const CATEGORIES = [
  '科技',
  '金融',
  '电商',
  '社交',
  '游戏',
  '教育',
  '医疗',
  '餐饮',
  '出行',
  '其他',
]

type CategoryName = (typeof CATEGORIES)[number]

const CATEGORY_DETAILS: Record<CategoryName, string> = {
  科技: 'SaaS、AI、平台型品牌',
  金融: '金融服务与企业识别',
  电商: '零售、消费与交易场景',
  社交: '社区、内容与互动产品',
  游戏: '高识别度与世界观表达',
  教育: '课程、知识与学习品牌',
  医疗: '可信赖、专业、克制',
  餐饮: '记忆点、符号感与包装',
  出行: '移动服务与效率体验',
  其他: '暂未归类的探索案例',
}

const PAGE_SIZE = 24

function LogoCard({ logo }: { logo: BrandLogo }) {
  return (
    <Link
      className="group flex h-[220px] flex-col overflow-hidden rounded-xl border border-border/70 bg-card/80 transition duration-200 hover:-translate-y-1 hover:border-foreground/20"
      href={`/logos/${logo._id}`}
    >
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_58%)] p-5">
        <div className="flex h-28 w-28 items-center justify-center">
          <img
            alt={logo.name}
            className="max-h-28 max-w-28 object-contain transition duration-300 group-hover:scale-[1.03]"
            draggable={false}
            height={112}
            src={logo.logoUrl}
            width={112}
          />
        </div>
      </div>
      <div className="flex h-14 items-center justify-between border-border/60 border-t px-4">
        <h3 className="truncate font-medium text-sm">{logo.name}</h3>
        <div className="text-muted-foreground">
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="overflow-hidden rounded-xl border" key={index}>
          <div className="flex h-[164px] items-center justify-center p-5">
            <Skeleton className="h-28 w-28 rounded-lg" />
          </div>
          <div className="flex h-14 items-center justify-between border-t px-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  canLoadMore,
  clearFilters,
  isLoading,
  isLoadingMore,
  loadMore,
}: {
  canLoadMore: boolean
  clearFilters: () => void
  isLoading: boolean
  isLoadingMore: boolean
  loadMore: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-dashed p-10 text-center">
        <p className="font-medium text-lg">当前筛选下还没有匹配案例</p>
        <p className="mt-2 text-muted-foreground text-sm">
          可以先清空筛选，或者继续加载更多 Logo 资源。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={clearFilters} variant="outline">
            清空筛选
          </Button>
          {canLoadMore && (
            <Button disabled={isLoading} onClick={loadMore} variant="secondary">
              {isLoadingMore ? '加载中...' : '加载更多'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LogoCatalog() {
  const {
    results: logos,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.brandLogos.listVisiblePaginated,
    {},
    { initialNumItems: PAGE_SIZE }
  )

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const normalizedQuery = query.trim().toLowerCase()

  const matchesQuery = (logo: BrandLogo) => {
    if (!normalizedQuery) {
      return true
    }

    return [
      logo.name,
      logo.description,
      logo.category,
      ...(logo.tags ?? []),
    ].some((value) => value?.toLowerCase().includes(normalizedQuery))
  }

  const matchesCategory = (logo: BrandLogo, nextCategory = category) =>
    nextCategory === 'all' || (logo.category ?? '其他') === nextCategory

  const matchesTag = (logo: BrandLogo, nextTag = activeTag) =>
    !nextTag || logo.tags?.includes(nextTag)

  const filtered = useMemo(
    () =>
      logos.filter(
        (logo) =>
          matchesQuery(logo) && matchesCategory(logo) && matchesTag(logo)
      ),
    [activeTag, category, logos, normalizedQuery]
  )

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      CATEGORIES.map((item) => [item, 0])
    ) as Record<CategoryName, number>

    for (const logo of logos) {
      if (!(matchesQuery(logo) && matchesTag(logo))) {
        continue
      }

      const nextCategory = (logo.category ?? '其他') as CategoryName
      counts[nextCategory] = (counts[nextCategory] ?? 0) + 1
    }

    return counts
  }, [activeTag, logos, normalizedQuery])

  const topTags = useMemo(() => {
    const counts = new Map<string, number>()

    for (const logo of logos) {
      if (!(matchesQuery(logo) && matchesCategory(logo))) {
        continue
      }

      for (const tag of logo.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }

    const tags = Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1]
        }

        return a[0].localeCompare(b[0], 'zh-CN')
      })
      .map(([tag, count]) => ({ tag, count }))

    if (activeTag && !tags.some((item) => item.tag === activeTag)) {
      return [
        { tag: activeTag, count: counts.get(activeTag) ?? 0 },
        ...tags,
      ].slice(0, 8)
    }

    return tags.slice(0, 8)
  }, [activeTag, category, logos, normalizedQuery])

  const isLoadingMore = status === 'LoadingMore'
  const canLoadMore = status === 'CanLoadMore'
  const categoryCount = Object.values(categoryCounts).filter(Boolean).length
  const activeFilterLabels = [
    query
      ? {
          key: 'query',
          label: `关键词 · ${query}`,
          onClear: () => setQuery(''),
        }
      : null,
    category !== 'all'
      ? {
          key: 'category',
          label: `行业 · ${category}`,
          onClear: () => setCategory('all'),
        }
      : null,
    activeTag
      ? {
          key: 'tag',
          label: `标签 · ${activeTag}`,
          onClear: () => setActiveTag(null),
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    label: string
    onClear: () => void
  }>

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    setActiveTag(null)
  }
  let mainContent = <LoadingSkeleton />

  if (status !== 'LoadingFirstPage') {
    if (filtered.length > 0) {
      mainContent = (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((logo) => (
            <LogoCard key={logo._id} logo={logo} />
          ))}
        </div>
      )
    } else {
      mainContent = (
        <EmptyState
          canLoadMore={canLoadMore}
          clearFilters={clearFilters}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          loadMore={() => loadMore(PAGE_SIZE)}
        />
      )
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.98))] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
          <div className="space-y-5">
            <Badge
              className="rounded-full px-3 py-1 text-xs"
              variant="secondary"
            >
              P0 主骨架 · Logo 案例库
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-semibold text-3xl tracking-tight sm:text-4xl">
                从“看卡片”升级成可浏览、可回访、可串联工具的 Logo 详情体系
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                先补齐案例列表、详情页、相关推荐与搜索入口，让用户能顺着案例继续浏览工具、网站与灵感资源。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: '已加载案例', value: `${logos.length}+` },
                { label: '筛选维度', value: '分类 / 标签 / 关键词' },
                { label: '下一跳', value: '详情页 / 工具 / 站点' },
              ].map((item) => (
                <div
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                  key={item.label}
                >
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="mt-2 font-medium text-base">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 self-start">
            {[
              {
                href: '/search?type=logo',
                icon: Search,
                title: '统一搜索',
                description: '跨案例、工具、网站、作者、方案统一检索。',
              },
              {
                href: '/sites',
                icon: Compass,
                title: '网站导航',
                description: '继续扩展灵感来源与外部参考站点。',
              },
              {
                href: '/tools',
                icon: Sparkles,
                title: '工具库',
                description: '从案例直接跳到配色、矢量化与导出工具。',
              },
            ].map((item) => (
              <Link
                className="group rounded-3xl border border-border/60 bg-background/80 p-4 transition hover:border-foreground/15 hover:bg-background"
                href={item.href}
                key={item.title}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium text-base">{item.title}</h2>
                      <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%)]" />
        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <Badge
                className="rounded-full px-3 py-1 text-xs"
                variant="secondary"
              >
                Explore Console
              </Badge>
              <div className="space-y-2">
                <h2 className="font-semibold text-2xl tracking-tight">
                  让筛选器更像一个探索台，而不是普通表单
                </h2>
                <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
                  先用关键词圈定方向，再按行业和热门标签逐层收窄，结果反馈会更明确。
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: '命中结果', value: filtered.length },
                { label: '可浏览行业', value: categoryCount },
                { label: '热门标签', value: topTags.length },
              ].map((item) => (
                <div
                  className="min-w-[112px] rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
                  key={item.label}
                >
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="mt-2 font-medium text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/85 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-foreground text-sm">
                <ScanSearch className="size-4" />
                <span>关键词检索</span>
              </div>
              <div className="relative mt-3">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-12 rounded-2xl border-border/70 bg-transparent pl-11 text-sm sm:text-base"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索品牌、行业、标签，例如：极简、几何、金融、餐饮"
                  value={query}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilterLabels.length > 0 ? (
                  activeFilterLabels.map((item) => (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1.5 text-sm transition hover:border-foreground/20 hover:text-foreground"
                      key={item.key}
                      onClick={item.onClear}
                      type="button"
                    >
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">×</span>
                    </button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    当前未开启额外筛选，适合先从关键词或行业切入。
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 font-medium text-sm">
                <LayoutGrid className="size-4" />
                <span>行业浏览</span>
              </div>
              <p className="text-muted-foreground text-sm">
                行业卡片会根据当前关键词和标签动态显示命中数量。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {CATEGORIES.map((item) => {
                const isActive = item === category
                const count = categoryCounts[item]

                return (
                  <button
                    className={cn(
                      'rounded-[1.5rem] border p-4 text-left transition',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border/70 bg-background/80 hover:border-foreground/15 hover:bg-background'
                    )}
                    key={item}
                    onClick={() => setCategory(isActive ? 'all' : item)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{item}</p>
                        <p
                          className={cn(
                            'mt-2 text-xs',
                            isActive
                              ? 'text-primary-foreground/75'
                              : 'text-muted-foreground'
                          )}
                        >
                          {CATEGORY_DETAILS[item]}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs',
                          isActive
                            ? 'bg-primary-foreground/12 text-primary-foreground'
                            : 'bg-secondary text-foreground'
                        )}
                      >
                        {count}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {topTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Tag className="size-4" />
                  <span>热门标签</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  标签来自当前已加载数据，可作为第二层快速收窄。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {topTags.map((item) => {
                  const isActive = item.tag === activeTag

                  return (
                    <button
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/70 bg-background/80 text-muted-foreground hover:text-foreground'
                      )}
                      key={item.tag}
                      onClick={() =>
                        setActiveTag((current) =>
                          current === item.tag ? null : item.tag
                        )
                      }
                      type="button"
                    >
                      <span>{item.tag}</span>
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[11px]',
                          isActive
                            ? 'bg-primary-foreground/12 text-primary-foreground'
                            : 'bg-secondary text-foreground'
                        )}
                      >
                        {item.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-xl">案例列表</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              当前展示 {filtered.length} 个结果
              {status !== 'Exhausted' ? ` · 已加载 ${logos.length} 个` : ''}
            </p>
          </div>
        </div>

        {mainContent}

        {(canLoadMore || isLoadingMore) && filtered.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              disabled={isLoading}
              onClick={() => loadMore(PAGE_SIZE)}
              variant="outline"
            >
              {isLoadingMore ? '加载中...' : '加载更多'}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
