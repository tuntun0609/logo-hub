import type { LucideIcon } from 'lucide-react'
import { ImageIcon, Upload, X } from 'lucide-react'
import type { DragEventHandler, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ToolPageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('space-y-6', className)}>{children}</div>
}

export function ToolWorkspace({
  children,
  className,
  size = 'lg',
}: {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-6',
        size === 'sm' && 'max-w-3xl',
        size === 'md' && 'max-w-4xl',
        size === 'lg' && 'max-w-5xl',
        size === 'xl' && 'max-w-6xl',
        size === 'full' && 'max-w-none',
        className
      )}
    >
      {children}
    </div>
  )
}

export function ToolPanel({
  children,
  className,
  padding = 'md',
  tone = 'default',
}: {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md'
  tone?: 'default' | 'muted' | 'subtle'
}) {
  return (
    <section
      className={cn(
        'rounded-[1.5rem] border backdrop-blur-sm',
        tone === 'default' &&
          'border-border/70 bg-card/80 shadow-[0_24px_80px_-56px_oklch(0.16_0_0_/_0.45)]',
        tone === 'muted' && 'border-border/60 bg-muted/20',
        tone === 'subtle' && 'border-border/50 bg-background/85',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-4 sm:p-5',
        className
      )}
    >
      {children}
    </section>
  )
}

export function ToolAlert({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-destructive text-sm shadow-sm',
        className
      )}
      role="alert"
    >
      {children}
    </div>
  )
}

export function ToolUploadZone({
  description,
  formats,
  icon: Icon = Upload,
  isDragging = false,
  maxSize,
  note,
  onClick,
  onDragLeave,
  onDragOver,
  onDrop,
  size = 'default',
  title,
  className,
}: {
  description: ReactNode
  formats?: string[]
  icon?: LucideIcon
  isDragging?: boolean
  maxSize?: string
  note?: ReactNode
  onClick?: () => void
  onDragLeave?: DragEventHandler<HTMLButtonElement>
  onDragOver?: DragEventHandler<HTMLButtonElement>
  onDrop?: DragEventHandler<HTMLButtonElement>
  size?: 'default' | 'compact'
  title: ReactNode
  className?: string
}) {
  return (
    <button
      aria-label="上传图片文件"
      className={cn(
        'group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed px-8 text-center transition duration-200 ease-out sm:px-10',
        size === 'default' ? 'gap-6 py-16 sm:py-20' : 'gap-5 py-12 sm:py-14',
        isDragging
          ? 'scale-[0.995] border-foreground/30 bg-muted/70'
          : 'border-muted-foreground/25 bg-card/55 hover:border-foreground/20 hover:bg-muted/35',
        className
      )}
      onClick={onClick}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      type="button"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.98_0_0_/_0.8),transparent_45%)] opacity-70 dark:bg-[radial-gradient(circle_at_top,oklch(0.3_0_0_/_0.25),transparent_48%)]" />
      <div
        className={cn(
          'relative flex size-14 items-center justify-center rounded-full border transition-colors',
          isDragging
            ? 'border-foreground/10 bg-foreground text-background'
            : 'border-border/70 bg-background/90 text-muted-foreground group-hover:text-foreground'
        )}
      >
        <Icon className="size-6" />
      </div>
      <div className="relative space-y-2">
        <p className="font-medium text-base text-foreground sm:text-lg">
          {title}
        </p>
        <p className="max-w-xl text-muted-foreground text-sm leading-6 sm:text-[0.95rem]">
          {description}
        </p>
      </div>
      {(formats?.length || maxSize) && (
        <div className="relative flex flex-wrap items-center justify-center gap-2">
          {formats?.map((format) => (
            <span
              className="inline-flex h-7 items-center rounded-full border border-border/70 bg-background/75 px-3 text-muted-foreground text-xs"
              key={format}
            >
              {format}
            </span>
          ))}
          {maxSize && (
            <span className="inline-flex h-7 items-center rounded-full bg-muted/70 px-3 text-muted-foreground text-xs">
              {maxSize}
            </span>
          )}
        </div>
      )}
      {note && (
        <p className="relative max-w-lg text-balance text-muted-foreground/85 text-xs">
          {note}
        </p>
      )}
    </button>
  )
}

export function ToolFileSummary({
  className,
  icon: Icon = ImageIcon,
  meta,
  name,
  onClear,
}: {
  className?: string
  icon?: LucideIcon
  meta: ReactNode
  name: string
  onClear?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border/70 bg-card/75 px-4 py-3 shadow-sm',
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/35 text-muted-foreground">
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{name}</p>
        <p className="truncate text-muted-foreground text-xs">{meta}</p>
      </div>
      {onClear && (
        <Button
          aria-label="移除图片"
          onClick={onClear}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
