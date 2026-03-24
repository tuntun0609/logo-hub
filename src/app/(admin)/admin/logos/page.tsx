'use client'

import { api } from '@convex/_generated/api'
import { usePaginatedQuery } from 'convex/react'
import { AdminLogosContent } from '@/components/admin/brand-logos'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 10

export default function AdminLogosPage() {
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.brandLogos.list,
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
            <Skeleton className="h-20 rounded-xl" key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLogosContent
      isLoading={isLoading}
      loadMore={() => loadMore(PAGE_SIZE)}
      logos={results}
      pageSize={PAGE_SIZE}
      status={status}
    />
  )
}
