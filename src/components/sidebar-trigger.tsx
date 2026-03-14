'use client'

import { PanelLeftCloseIcon } from '@/components/ui/panel-left-close'
import { PanelLeftOpenIcon } from '@/components/ui/panel-left-open'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useSidebar()

  return (
    <Button
      className={cn(className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      size="icon-sm"
      variant="ghost"
      {...props}
    >
      {state === 'expanded' ? (
        <PanelLeftCloseIcon
          className={cn('cursor-pointer', className)}
          size={18}
        />
      ) : (
        <PanelLeftOpenIcon
          className={cn('cursor-pointer', className)}
          size={18}
        />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export { SidebarTrigger }
