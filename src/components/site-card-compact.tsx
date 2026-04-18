import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { CuratedSiteWithTags } from '@/lib/data/sites'

interface SiteCardCompactProps {
  site: CuratedSiteWithTags
}

export function SiteCardCompact({ site }: SiteCardCompactProps) {
  return (
    <a
      className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-muted/30"
      href={site.href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted/40">
        {site.image ? (
          <Image
            alt={site.name}
            className="object-cover"
            fill
            sizes="40px"
            src={site.image}
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="select-none font-semibold text-muted-foreground/25 text-sm">
              {site.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-medium text-sm">{site.name}</h3>
            <ExternalLink className="size-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
          </div>
          {site.description && (
            <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
              {site.description}
            </p>
          )}
        </div>

        {site.tags && site.tags.length > 0 && (
          <div className="hidden shrink-0 gap-1 sm:flex">
            {site.tags.slice(0, 2).map((tag) => (
              <Badge
                className="rounded-md bg-muted/50 px-1.5 py-0 font-normal text-[11px] text-muted-foreground"
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
