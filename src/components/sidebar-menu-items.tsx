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
    <SidebarMenu className="gap-1.5">
      {items.map((item) => {
        const href = item.url
        const itemContent = (
          <>
            <item.icon
              className={cn(
                'transition-all duration-200',
                item.isActive
                  ? 'text-primary'
                  : 'group-hover/button:scale-110 group-hover/button:text-foreground'
              )}
            />
            <span
              className={cn(
                'transition-colors duration-200',
                item.isActive ? 'font-semibold' : 'font-medium'
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
                'group/button transition-all duration-200',
                item.isActive
                  ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
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
                    ? 'bg-primary/20 text-primary'
                    : 'bg-primary/10 text-primary group-hover/button:bg-primary/20'
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
