'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import {
  ChevronsUpDown,
  CircleHelp,
  Compass,
  GalleryVerticalEnd,
  Hexagon,
  Home,
  Images,
  Loader2,
  LogIn,
  LogOut,
  MessageSquarePlus,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
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
  SidebarRail,
} from '@/components/ui/sidebar'

const discoverItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Showcase', icon: GalleryVerticalEnd },
  { title: 'Gallery', icon: Images, badge: 'New' },
  { title: 'Navigate', icon: Compass },
  { title: 'Authors', icon: Users },
]

const toolItems = [
  { title: 'Generate', icon: Sparkles, badge: 'Beta' },
  { title: 'Tools', url: '/tools', icon: Wrench },
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
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { setTheme } = useTheme()
  const pathname = usePathname()

  const withActive = (items: typeof discoverItems) =>
    items.map((item) => ({
      ...item,
      isActive: item.url ? pathname === item.url : false,
    }))

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
                    Platform
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

          <SidebarMenuItem>
            <Authenticated>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(triggerProps) => (
                    <SidebarMenuButton
                      {...triggerProps}
                      size="lg"
                      tooltip={user?.fullName || 'Account'}
                    >
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage
                          alt={user?.fullName || ''}
                          src={user?.imageUrl}
                        />
                        <AvatarFallback className="rounded-lg">
                          {getUserInitials(user?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.fullName}
                        </span>
                        <span className="truncate text-muted-foreground text-xs">
                          {user?.primaryEmailAddress?.emailAddress}
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
                          <AvatarImage
                            alt={user?.fullName || ''}
                            src={user?.imageUrl}
                          />
                          <AvatarFallback className="rounded-lg">
                            {getUserInitials(user?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left leading-tight">
                          <span className="truncate font-semibold text-sm">
                            {user?.fullName}
                          </span>
                          <span className="mt-0.5 truncate text-muted-foreground text-xs">
                            {user?.primaryEmailAddress?.emailAddress}
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
                    <DropdownMenuItem
                      className="py-2"
                      onClick={() => signOut()}
                    >
                      <LogOut />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Authenticated>
            <Unauthenticated>
              <SidebarMenuButton
                render={(buttonProps) => (
                  <Link {...buttonProps} href="/sign-in">
                    <LogIn />
                    <span>Sign In</span>
                  </Link>
                )}
                tooltip="Sign In"
              />
            </Unauthenticated>
            <AuthLoading>
              <SidebarMenuButton className="justify-center" disabled size="lg">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </SidebarMenuButton>
            </AuthLoading>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
