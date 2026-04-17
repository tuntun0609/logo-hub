'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface CategoryPillsProps {
  activeId?: number
  categories: { id: number; name: string; count: number }[]
}

export function CategoryPills({ categories, activeId }: CategoryPillsProps) {
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view')

  function viewSuffix() {
    return currentView ? `?view=${currentView}` : ''
  }

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="sticky top-0 z-10 -mx-1 bg-background/80 px-1 py-3 backdrop-blur-sm">
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
        <Link
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
            activeId == null
              ? 'bg-primary text-primary-foreground'
              : 'bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]'
          }`}
          href={`/sites${viewSuffix()}`}
        >
          全部 ({totalCount})
        </Link>
        {categories.map((cat) => (
          <Link
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
              activeId === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]'
            }`}
            href={`/sites/${cat.id}${viewSuffix()}`}
            key={cat.id}
          >
            {cat.name} ({cat.count})
          </Link>
        ))}
      </div>
    </div>
  )
}
