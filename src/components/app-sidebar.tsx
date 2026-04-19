'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import {
  ChevronsUpDown,
  CircleHelp,
  Compass,
  Eraser,
  FileImage,
  Hexagon,
  Home,
  Loader2,
  LogIn,
  LogOut,
  MessageSquarePlus,
  Monitor,
  Moon,
  Palette,
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

const toolItems = [
  { title: '全部工具', url: '/tools', icon: Wrench },
  { title: 'Icon Maker', url: '/tools/icon-maker', icon: Sparkles },
  { title: 'ICO Converter', url: '/tools/ico-converter', icon: FileImage },
  {
    title: 'Background Remover',
    url: '/tools/background-remover',
    icon: Eraser,
  },
  { title: 'Color Extractor', url: '/tools/color-extractor', icon: Palette },
]

const discoverItems = [
  { title: '网站导航', url: '/sites', icon: Compass },
  { title: '作者专区', url: '/authors', icon: Users },
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

      const isExact = item.url === '/' || item.url === '/tools'
      const isActive = isExact
        ? pathname === item.url
        : pathname === item.url || pathname.startsWith(`${item.url}/`)

      return { ...item, isActive }
    })

  let footerUserMenu: ReactNode
  if (!isLoaded) {
    footerUserMenu = (
      <SidebarMenuButton
        className="justify-center rounded-xl border border-transparent hover:border-border/70 hover:bg-foreground/3 dark:hover:bg-background/40"
        disabled
        size="lg"
      >
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
              className="rounded-xl border border-transparent hover:border-border/70 hover:bg-foreground/3 dark:hover:bg-background/40"
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
        className="rounded-xl border border-transparent hover:border-border/70 hover:bg-foreground/3 dark:hover:bg-background/40"
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
    <Sidebar
      className="group-data-[collapsible=icon]:p-2 group-data-[variant=floating]:p-3"
      collapsible="icon"
      variant="floating"
      {...props}
    >
      <SidebarHeader className="gap-0 border-border/70 border-b px-3 pt-3 pb-3 group-data-[collapsible=icon]:px-0">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1.5">
          <SidebarMenu className="min-w-0 flex-1 group-data-[collapsible=icon]:flex-none">
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-11 justify-start rounded-xl pl-0 hover:bg-transparent active:bg-transparent data-active:bg-transparent group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                render={(buttonProps) => (
                  <Link {...buttonProps} href="/">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-foreground/4 text-foreground dark:bg-background/70">
                      <Hexagon className="size-4" />
                    </div>
                    <span className="min-w-0 font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
                      Logo Hub
                    </span>
                  </Link>
                )}
                size="lg"
                tooltip="Logo Hub"
              />
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger className="shrink-0 rounded-lg border border-transparent hover:border-border/70 hover:bg-foreground/4 dark:hover:bg-background/70" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 pt-3 pb-1 group-data-[collapsible=icon]:px-0.5">
          <SidebarGroupContent>
            <SidebarMenuItems
              items={withActive([{ title: '首页', url: '/', icon: Home }])}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 py-1 group-data-[collapsible=icon]:px-0.5">
          <SidebarGroupLabel className="px-3 font-medium text-[11px] text-muted-foreground/75 uppercase tracking-[0.14em]">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItems items={withActive(toolItems)} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 py-1 group-data-[collapsible=icon]:px-0.5">
          <SidebarGroupLabel className="px-3 font-medium text-[11px] text-muted-foreground/75 uppercase tracking-[0.14em]">
            Discover
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItems items={withActive(discoverItems)} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-border/70 border-t px-2 pt-3 pb-2 group-data-[collapsible=icon]:px-0.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(triggerProps) => (
                  <SidebarMenuButton
                    {...triggerProps}
                    className="rounded-xl border border-transparent hover:border-border/70 hover:bg-foreground/3 dark:hover:bg-background/40"
                    tooltip="Theme"
                  >
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
