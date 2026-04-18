import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { SitesCategoryPageContent } from '@/components/sites/sites-category-page-content'
import { getCategories, getCategoryById, getSites } from '@/lib/data/sites'
import { queryKeys } from '@/lib/query/keys'
import { getQueryClient } from '@/lib/query/server'

interface SitesCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function SitesCategoryPage({
  params,
}: SitesCategoryPageProps) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (Number.isNaN(id)) {
    notFound()
  }

  const category = await getCategoryById(id)
  if (!category) {
    notFound()
  }

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
      <SitesCategoryPageContent categoryId={id} categoryName={category.name} />
    </HydrationBoundary>
  )
}
