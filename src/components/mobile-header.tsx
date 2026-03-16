'use client'

import { Hexagon } from 'lucide-react'
import { SidebarTrigger } from '@/components/sidebar-trigger'

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-3 py-4 backdrop-blur-sm md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Hexagon className="size-4" />
        </div>
        <span className="font-semibold text-sm">Logo Hub</span>
      </div>
      <SidebarTrigger />
    </header>
  )
}
