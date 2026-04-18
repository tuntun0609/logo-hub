import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { HomeContent } from '@/components/home/home-content'
import { getCategories, getSites } from '@/lib/data/sites'
import { queryKeys } from '@/lib/query/keys'
import { getQueryClient } from '@/lib/query/server'

export default async function HomePage() {
  const qc = getQueryClient()
  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.categories.all,
      queryFn: getCategories,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.sites.list(),
      queryFn: () => getSites(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HomeContent />
    </HydrationBoundary>
  )
}
