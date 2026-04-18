'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { SiteCard } from '@/components/site-card'
import { SiteCardCompact } from '@/components/site-card-compact'
import { CategoryPills } from '@/components/sites/category-pills'
import { ViewToggle } from '@/components/sites/view-toggle'
import { useSiteCategories, useSitesList } from '@/lib/query/hooks/use-sites'

export function SitesCategoryPageContent({
  categoryId,
  categoryName,
}: {
  categoryId: number
  categoryName: string
}) {
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') === 'list' ? 'list' : 'grid'

  const { data: categories = [] } = useSiteCategories()
  const { data: allSites = [] } = useSitesList()

  const sites = useMemo(
    () => allSites.filter((s) => s.category === categoryName),
    [allSites, categoryName]
  )

  const categoryPillData = useMemo(() => {
    const categoryCounts = new Map<string, number>()
    for (const site of allSites) {
      categoryCounts.set(
        site.category,
        (categoryCounts.get(site.category) ?? 0) + 1
      )
    }
    return categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        count: categoryCounts.get(c.name) ?? 0,
      }))
      .filter((c) => c.count > 0)
  }, [allSites, categories])

  let content = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sites.map((site, index) => (
        <SiteCard
          imageLoading={index === 0 ? 'eager' : undefined}
          key={site.id}
          site={site}
        />
      ))}
    </div>
  )

  if (sites.length === 0) {
    content = (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">该分类下暂无网站</p>
        <Link
          className="mt-4 inline-block text-sm underline-offset-4 hover:underline"
          href="/sites"
        >
          返回网站导航
        </Link>
      </div>
    )
  } else if (currentView === 'list') {
    content = (
      <div className="space-y-2">
        {sites.map((site) => (
          <SiteCardCompact key={site.id} site={site} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          className="flex items-center gap-1.5 text-muted-foreground text-sm transition hover:text-foreground"
          href="/sites"
        >
          <ArrowLeft className="size-3.5" />
          网站导航
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm">{categoryName}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">
            {categoryName}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            共 {sites.length} 个网站
          </p>
        </div>
        <ViewToggle />
      </div>

      <CategoryPills activeId={categoryId} categories={categoryPillData} />

      {content}
    </div>
  )
}
