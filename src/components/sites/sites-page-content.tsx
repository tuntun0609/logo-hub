'use client'

import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { SiteCard } from '@/components/site-card'
import { SiteCardCompact } from '@/components/site-card-compact'
import { CategoryPills } from '@/components/sites/category-pills'
import { ViewToggle } from '@/components/sites/view-toggle'
import { Input } from '@/components/ui/input'
import type { CuratedSiteWithTags } from '@/lib/data/sites'
import { useSiteCategories, useSitesList } from '@/lib/query/hooks/use-sites'

export function SitesPageContent({ initialSearch }: { initialSearch: string }) {
  const [rawQuery, setRawQuery] = useState(initialSearch)
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') === 'list' ? 'list' : 'grid'

  const { data: categories = [] } = useSiteCategories()
  const { data: allSites = [] } = useSitesList()

  const query = rawQuery.trim().toLowerCase()

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

  const isSearching = query.length > 0
  const searchResults = useMemo(() => {
    if (!isSearching) {
      return []
    }
    return allSites.filter((site) =>
      [site.name, site.description, ...(site.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [allSites, isSearching, query])

  const sitesByCategory = useMemo(() => {
    const map = new Map<string, CuratedSiteWithTags[]>()
    if (isSearching) {
      return map
    }
    for (const cat of categories) {
      map.set(cat.name, [])
    }
    for (const site of allSites) {
      map.get(site.category)?.push(site)
    }
    return map
  }, [allSites, categories, isSearching])

  const GROUP_LIMIT = 6

  let searchContent = (
    <div className="py-20 text-center">
      <p className="font-medium text-muted-foreground">没有找到匹配网站</p>
      <p className="mt-2 text-muted-foreground/70 text-sm">试试其他关键词</p>
    </div>
  )

  if (searchResults.length > 0) {
    searchContent = (
      <div>
        <p className="mb-4 text-muted-foreground text-sm">
          找到 {searchResults.length} 个结果
        </p>
        {currentView === 'list' ? (
          <div className="space-y-2">
            {searchResults.map((site) => (
              <SiteCardCompact key={site.id} site={site} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {searchResults.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">网站导航</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            共 {allSites.length} 个网站
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="搜索网站..."
              value={rawQuery}
            />
          </div>
          <ViewToggle />
        </div>
      </div>

      <CategoryPills categories={categoryPillData} />

      {isSearching ? (
        searchContent
      ) : (
        <div className="space-y-12">
          {categories.map((cat) => {
            const sites = sitesByCategory.get(cat.name) ?? []
            if (sites.length === 0) {
              return null
            }

            const hasMore = sites.length > GROUP_LIMIT
            const preview = hasMore ? sites.slice(0, GROUP_LIMIT) : sites
            const categoryHref = `/sites/${cat.id}`

            return (
              <section className="space-y-4" key={cat.id}>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-semibold text-base">{cat.name}</h2>
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
                {currentView === 'list' ? (
                  <div className="space-y-2">
                    {preview.map((site) => (
                      <SiteCardCompact key={site.id} site={site} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {preview.map((site, index) => (
                      <SiteCard
                        imageLoading={index === 0 ? 'eager' : undefined}
                        key={site.id}
                        site={site}
                      />
                    ))}
                  </div>
                )}
                {hasMore && (
                  <div>
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-muted-foreground text-sm transition hover:border-foreground/20 hover:text-foreground"
                      href={categoryHref}
                    >
                      查看「{cat.name}」全部 {sites.length} 个网站
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
