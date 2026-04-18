import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { AuthorsPageContent } from '@/components/authors/authors-page-content'
import { getVisibleAuthors } from '@/lib/data/authors'
import { queryKeys } from '@/lib/query/keys'
import { getQueryClient } from '@/lib/query/server'

export default async function AuthorsPage() {
  const qc = getQueryClient()
  await qc.prefetchQuery({
    queryKey: queryKeys.authors.visible,
    queryFn: getVisibleAuthors,
  })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <AuthorsPageContent />
    </HydrationBoundary>
  )
}
