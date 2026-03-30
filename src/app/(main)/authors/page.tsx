export const dynamic = 'force-dynamic'

import { Sparkles } from 'lucide-react'
import { AuthorCard } from '@/components/author-card'
import { Badge } from '@/components/ui/badge'
import { getVisibleAuthors } from '@/lib/actions/authors'

export default async function AuthorsPage() {
  const authors = await getVisibleAuthors()

  const featured = authors.filter((a) => a.featured)
  const rest = authors.filter((a) => !a.featured)

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.98))] p-6 sm:p-8">
        <Badge className="rounded-full px-3 py-1 text-xs" variant="secondary">
          作者专区
        </Badge>
        <div className="mt-5">
          <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            Logo 创作者
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            发现优秀的 Logo 设计师与品牌创作者，了解他们的作品与设计理念。
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <h2 className="font-semibold text-lg">编辑推荐</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((author) => (
              <AuthorCard author={author} key={author.id} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">全部作者</h2>
        {rest.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((author) => (
              <AuthorCard author={author} key={author.id} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            {featured.length > 0 ? '暂无更多作者' : '暂无作者数据'}
          </p>
        )}
      </section>
    </div>
  )
}
