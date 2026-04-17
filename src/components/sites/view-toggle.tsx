'use client'

import { LayoutGrid, List } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function ViewToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') === 'list' ? 'list' : 'grid'

  function toggle(view: 'grid' | 'list') {
    const params = new URLSearchParams(searchParams.toString())
    if (view === 'list') {
      params.set('view', 'list')
    } else {
      params.delete('view')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex rounded-lg border">
      <button
        className={`flex size-8 items-center justify-center transition-colors ${
          currentView === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'
        }`}
        onClick={() => toggle('grid')}
        type="button"
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        className={`flex size-8 items-center justify-center border-l transition-colors ${
          currentView === 'list' ? 'bg-muted' : 'hover:bg-muted/50'
        }`}
        onClick={() => toggle('list')}
        type="button"
      >
        <List className="size-4" />
      </button>
    </div>
  )
}
