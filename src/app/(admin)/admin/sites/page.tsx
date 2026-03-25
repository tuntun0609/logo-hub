'use client'

import { api } from '@convex/_generated/api'
import { usePaginatedQuery } from 'convex/react'
import { AdminSitesContent } from '@/components/admin/curated-sites'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 20

export default function AdminSitesPage() {
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.curatedSites.list,
    {},
    { initialNumItems: PAGE_SIZE }
  )

  if (status === 'LoadingFirstPage') {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-16 rounded-xl" key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminSitesContent
      isLoading={isLoading}
      loadMore={() => loadMore(PAGE_SIZE)}
      pageSize={PAGE_SIZE}
      sites={results}
      status={status}
    />
  )
}
