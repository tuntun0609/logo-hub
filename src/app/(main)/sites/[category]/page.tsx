export const dynamic = 'force-dynamic'

import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { CuratedSiteWithTags } from '@/lib/actions/sites'
import { getSites } from '@/lib/actions/sites'

function SiteCard({ site }: { site: CuratedSiteWithTags }) {
  return (
    <a
      className="group flex flex-col gap-2 rounded-2xl border border-border/70 p-4 transition hover:-translate-y-0.5 hover:border-foreground/15"
      href={site.href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-snug">{site.name}</p>
        <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      </div>
      <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
        {site.description}
      </p>
      {site.notes && (
        <p className="truncate text-muted-foreground/70 text-xs italic">
          {site.notes}
        </p>
      )}
      {site.tags && site.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {site.tags.slice(0, 3).map((tag) => (
            <Badge className="text-[11px]" key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </a>
  )
}

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
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  )
}
