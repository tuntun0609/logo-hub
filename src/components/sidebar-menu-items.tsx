import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export interface SidebarMenuItemData {
  badge?: string
  icon: LucideIcon
  isActive?: boolean
  title: string
  url?: string
}

interface SidebarMenuItemsProps {
  items: SidebarMenuItemData[]
}

export function SidebarMenuItems({ items }: SidebarMenuItemsProps) {
  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const href = item.url
        const itemContent = (
          <>
            <item.icon
              className={cn(
                'size-4 shrink-0 self-center transition-colors duration-200',
                item.isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
            <span
              className={cn(
                'min-w-0 flex-1 text-sm leading-none transition-colors duration-200 group-data-[collapsible=icon]:hidden',
                item.isActive ? 'font-semibold text-foreground' : 'font-medium'
              )}
            >
              {item.title}
            </span>
          </>
        )

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              className={cn(
                'group/button min-h-10 items-center justify-start gap-3 rounded-xl border border-transparent px-3 py-2 transition-[background-color,border-color,color] duration-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:[&_svg]:translate-x-px',
                item.isActive
                  ? 'border-border bg-foreground/4 text-foreground hover:bg-foreground/5.5 dark:bg-background/50 dark:hover:bg-background/70'
                  : 'text-muted-foreground hover:border-border/70 hover:bg-foreground/3 hover:text-foreground dark:hover:bg-background/40'
              )}
              isActive={item.isActive}
              render={
                href
                  ? (buttonProps) => (
                      <Link {...buttonProps} href={href}>
                        {itemContent}
                      </Link>
                    )
                  : undefined
              }
              tooltip={item.title}
            >
              {itemContent}
            </SidebarMenuButton>
            {item.badge && (
              <SidebarMenuBadge
                className={cn(
                  'transition-all duration-200',
                  item.isActive
                    ? 'bg-foreground/10 text-foreground'
                    : 'bg-foreground/6 text-muted-foreground group-hover/button:bg-foreground/10 group-hover/button:text-foreground'
                )}
              >
                {item.badge}
              </SidebarMenuBadge>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
