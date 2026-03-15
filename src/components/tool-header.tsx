import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/ui/arrow-left'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ToolHeader({
  title,
  description,
  backHref = '/tools',
}: {
  title: string
  description?: string
  backHref?: string
}) {
  return (
    <div className="sticky top-2 z-10 flex items-center gap-2 rounded-lg bg-background/80 py-3 shadow-black/5 backdrop-blur-sm">
      <Link
        className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }))}
        href={backHref}
      >
        <ArrowLeftIcon size={16} />
      </Link>
      <div className="min-w-0">
        <h1 className="truncate font-semibold text-base tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="truncate text-muted-foreground text-xs">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
