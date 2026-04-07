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
    <div className="flex aspect-video w-full items-center justify-center bg-muted/30">
      <span className="font-medium text-3xl text-muted-foreground/30">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export function SiteCard({ site, imageLoading }: SiteCardProps) {
  return (
    <a
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/20"
      href={site.href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="relative aspect-video w-full overflow-hidden border-border/50 border-b bg-muted/10">
        {site.image ? (
          <Image
            alt={site.name}
            className="object-cover"
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
          <h3 className="font-semibold text-base text-foreground leading-tight tracking-tight">
            {site.name}
          </h3>
          <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-foreground" />
        </div>

        <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
          {site.description}
        </p>

        {site.tags && site.tags.length > 0 && (
          <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-1.5">
              {site.tags.slice(0, 3).map((tag) => (
                <Badge
                  className="rounded-md bg-muted/50 px-2 py-0.5 font-medium text-[11px] text-muted-foreground"
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
