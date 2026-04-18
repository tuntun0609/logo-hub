import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeftIcon } from '@/components/ui/arrow-left'
import { cn } from '@/lib/utils'

export function ToolHeader({
  actions,
  className,
  title,
  description,
  backHref = '/tools',
  backLabel = '返回工具库',
  eyebrow = '在线工具',
  meta = [],
  variant = 'hero',
}: {
  actions?: ReactNode
  className?: string
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  eyebrow?: string
  meta?: string[]
  variant?: 'compact' | 'hero'
}) {
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 shadow-[0_24px_80px_-56px_oklch(0.16_0_0_/_0.45)] backdrop-blur-sm',
        isCompact ? 'px-4 py-4 sm:px-5' : 'px-5 py-5 sm:px-6 sm:py-6',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.97_0_0_/_0.9),transparent_40%),radial-gradient(circle_at_85%_15%,oklch(0.93_0_0_/_0.8),transparent_28%)] opacity-80 dark:bg-[radial-gradient(circle_at_top_left,oklch(0.33_0_0_/_0.45),transparent_45%),radial-gradient(circle_at_85%_15%,oklch(0.42_0_0_/_0.25),transparent_28%)]" />
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
      <div
        className={cn(
          'relative flex gap-4',
          isCompact
            ? 'flex-col md:flex-row md:items-center md:justify-between'
            : 'flex-col lg:flex-row lg:items-end lg:justify-between'
        )}
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className={cn(
                'inline-flex h-7 select-none items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] rounded-full border border-border/70 bg-background/70 px-3 font-medium text-[0.8rem] outline-none transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:hover:bg-muted/50',
                'gap-1.5 rounded-full border border-border/70 bg-background/70 px-3'
              )}
              href={backHref}
            >
              <ArrowLeftIcon size={16} />
              {backLabel}
            </Link>
            <span className="inline-flex h-7 items-center rounded-full border border-border/70 bg-background/70 px-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
              {eyebrow}
            </span>
            {meta.map((item) => (
              <span
                className="inline-flex h-7 items-center rounded-full bg-muted/70 px-3 text-muted-foreground text-xs"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <h1
              className={cn(
                'min-w-0 font-semibold leading-tight tracking-tight',
                isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  'max-w-2xl text-muted-foreground',
                  isCompact ? 'text-sm' : 'text-sm sm:text-base'
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="relative flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
