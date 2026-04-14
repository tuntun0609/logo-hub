import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { CuratedSiteWithTags } from '@/lib/actions/sites'

interface SiteCardProps {
  imageLoading?: 'eager' | 'lazy'
  site: CuratedSiteWithTags
}

function SitePlaceholder({ name }: { name: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-muted/40">
      <span className="select-none font-semibold text-2xl text-muted-foreground/25">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export function SiteCard({ site, imageLoading }: SiteCardProps) {
  return (
    <a
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/30"
      href={site.href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="relative aspect-video w-full overflow-hidden border-b bg-muted/10">
        {site.image ? (
          <Image
            alt={site.name}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            loading={imageLoading}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            src={site.image}
            unoptimized
          />
        ) : (
          <SitePlaceholder name={site.name} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-sm leading-tight">{site.name}</h3>
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        </div>

        <p className="mt-1.5 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {site.description}
        </p>

        {site.tags && site.tags.length > 0 && (
          <div className="mt-auto pt-3">
            <div className="flex flex-wrap gap-1">
              {site.tags.slice(0, 3).map((tag) => (
                <Badge
                  className="rounded-md bg-muted/50 px-1.5 py-0 font-normal text-[11px] text-muted-foreground"
                  key={tag}
                  variant="secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </a>
  )
}
