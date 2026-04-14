export const dynamic = 'force-dynamic'

import { Sparkles } from 'lucide-react'
import { AuthorCard } from '@/components/author-card'
import { getVisibleAuthors } from '@/lib/actions/authors'

export default async function AuthorsPage() {
  const authors = await getVisibleAuthors()

  const featured = authors.filter((a) => a.featured)
  const rest = authors.filter((a) => !a.featured)

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Logo 创作者</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          发现优秀的 Logo 设计师与品牌创作者，了解他们的作品与设计理念。
        </p>
      </div>

      {featured.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <h2 className="font-semibold text-base">编辑推荐</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((author) => (
              <AuthorCard author={author} key={author.id} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-5">
        <h2 className="font-semibold text-base">全部作者</h2>
        {rest.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((author) => (
              <AuthorCard author={author} key={author.id} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground text-sm">
            {featured.length > 0 ? '暂无更多作者' : '暂无作者数据'}
          </p>
        )}
      </section>
    </div>
  )
}
