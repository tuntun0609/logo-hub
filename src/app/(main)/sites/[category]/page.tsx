export const dynamic = 'force-dynamic'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SiteCard } from '@/components/site-card'
import { getSites } from '@/lib/actions/sites'

export default async function SitesCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: encodedCategory } = await params
  const category = decodeURIComponent(encodedCategory)
  const sites = await getSites(category)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          className="flex items-center gap-1.5 text-muted-foreground text-sm transition hover:text-foreground"
          href="/sites"
        >
          <ArrowLeft className="size-3.5" />
          网站导航
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm">{category}</span>
      </div>

      <div>
        <h1 className="font-semibold text-3xl tracking-tight">{category}</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          共 {sites.length} 个网站
        </p>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">该分类下暂无网站</p>
          <Link
            className="mt-4 inline-block text-sm underline-offset-4 hover:underline"
            href="/sites"
          >
            返回网站导航
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sites.map((site, index) => (
            <SiteCard
              imageLoading={index === 0 ? 'eager' : undefined}
              key={site.id}
              site={site}
            />
          ))}
        </div>
      )}
    </div>
  )
}
