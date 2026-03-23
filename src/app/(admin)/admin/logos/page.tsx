'use client'

import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { AdminLogosContent } from '@/components/admin/brand-logos'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLogosPage() {
  const logos = useQuery(api.brandLogos.list)

  if (logos === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton className="aspect-square rounded-xl" key={i} />
          ))}
        </div>
      </div>
    )
  }

  return <AdminLogosContent logos={logos} />
}
