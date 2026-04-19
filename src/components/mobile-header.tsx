'use client'

import { Hexagon } from 'lucide-react'
import { SidebarTrigger } from '@/components/sidebar-trigger'

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-border/70 border-b bg-background/92 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl border border-border/70 bg-foreground/[0.04] text-foreground dark:bg-background/70">
          <Hexagon className="size-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Logo Hub</span>
      </div>
      <SidebarTrigger className="rounded-lg border border-transparent hover:border-border/70 hover:bg-foreground/[0.04] dark:hover:bg-background/70" />
    </header>
  )
}
