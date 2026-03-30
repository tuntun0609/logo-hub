'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import {
  ChevronsUpDown,
  CircleHelp,
  Compass,
  Hexagon,
  Home,
  Images,
  Loader2,
  LogIn,
  LogOut,
  MessageSquarePlus,
  Monitor,
  Moon,
  Search,
  Sparkles,
  Sun,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import type { ReactNode } from 'react'
import { SidebarMenuItems } from '@/components/sidebar-menu-items'
import { SidebarTrigger } from '@/components/sidebar-trigger'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const discoverItems = [
  { title: '首页', url: '/', icon: Home },
  { title: '网站导航', url: '/sites', icon: Compass },
  { title: '统一搜索', url: '/search', icon: Search, badge: 'P0' },
  { title: '作者专区', url: '/authors', icon: Users },
  { title: '专题内容', icon: Images, badge: 'Soon' },
]

const toolItems = [
  { title: 'Logo 生成', icon: Sparkles, badge: 'Beta' },
  { title: '工具库', url: '/tools', icon: Wrench },
]

function getUserInitials(name?: string | null) {
  if (!name) {
    return '?'
  }
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { setTheme } = useTheme()
  const pathname = usePathname()

  const withActive = (items: typeof discoverItems) =>
    items.map((item) => {
      if (!item.url) {
        return { ...item, isActive: false }
      }

      const isRoot = item.url === '/'
      const isActive = isRoot
        ? pathname === '/'
        : pathname === item.url || pathname.startsWith(`${item.url}/`)

      return { ...item, isActive }
    })

  let footerUserMenu: ReactNode
  if (!isLoaded) {
    footerUserMenu = (
      <SidebarMenuButton className="justify-center" disabled size="lg">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </SidebarMenuButton>
    )
  } else if (user) {
    footerUserMenu = (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(triggerProps) => (
            <SidebarMenuButton
              {...triggerProps}
              size="lg"
              tooltip={user.fullName || 'Account'}
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage alt={user.fullName || ''} src={user.imageUrl} />
                <AvatarFallback className="rounded-lg">
                  {getUserInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.fullName}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          )}
        />
        <DropdownMenuContent
          align="end"
          className="w-60 p-2"
          side="right"
          sideOffset={8}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 p-2 text-left text-sm">
                <Avatar className="size-9 rounded-lg">
                  <AvatarImage alt={user.fullName || ''} src={user.imageUrl} />
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-sm">
                    {user.fullName}
                  </span>
                  <span className="mt-0.5 truncate text-muted-foreground text-xs">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="py-2"
              onClick={() => openUserProfile()}
            >
              <UserCog />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <CircleHelp />
              Help
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <MessageSquarePlus />
              Feedback
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="py-2" onClick={() => signOut()}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    footerUserMenu = (
      <SidebarMenuButton
        render={(buttonProps) => (
          <Link {...buttonProps} href="/sign-in">
            <LogIn />
            <span>Sign In</span>
          </Link>
        )}
        tooltip="Sign In"
      />
    )
  }

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-4 group-data-[state=collapsed]:flex-col">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Hexagon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Logo Hub</span>
                  <span className="truncate text-muted-foreground text-xs">
                    Tool + Content + Directory
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItems items={withActive(discoverItems)} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItems items={withActive(toolItems)} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(triggerProps) => (
                  <SidebarMenuButton {...triggerProps} tooltip="Theme">
                    <div className="relative size-4 shrink-0">
                      <Sun className="absolute inset-0 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span>Theme</span>
                  </SidebarMenuButton>
                )}
              />
              <DropdownMenuContent align="end" side="right">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>{footerUserMenu}</SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
