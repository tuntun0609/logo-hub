import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { SitesPageContent } from '@/components/sites/sites-page-content'
import { getCategories, getSites } from '@/lib/data/sites'
import { queryKeys } from '@/lib/query/keys'
import { getQueryClient } from '@/lib/query/server'

interface SitesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function SitesPage({ searchParams }: SitesPageProps) {
  const params = await searchParams
  const rawQuery = firstValue(params.q)?.trim() ?? ''

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
      <SitesPageContent initialSearch={rawQuery} />
    </HydrationBoundary>
  )
}
