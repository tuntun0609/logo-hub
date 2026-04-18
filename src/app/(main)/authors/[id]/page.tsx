import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { AuthorDetailContent } from '@/components/authors/author-detail-content'
import { getAuthorById } from '@/lib/data/authors'
import { queryKeys } from '@/lib/query/keys'
import { getQueryClient } from '@/lib/query/server'

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const authorId = Number(id)
  const author = await getAuthorById(authorId)

  if (!author) {
    notFound()
  }

  const qc = getQueryClient()
  await qc.prefetchQuery({
    queryKey: queryKeys.authors.detail(authorId),
    queryFn: async () => author,
  })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <AuthorDetailContent authorId={authorId} />
    </HydrationBoundary>
  )
}
