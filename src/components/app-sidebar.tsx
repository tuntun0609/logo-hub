'use client'

import { SignInButton, UserButton } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import {
  Compass,
  FolderOpen,
  Hexagon,
  Home,
  LogIn,
  Settings,
  Wrench,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

const platformItems = [
  { title: 'Home', icon: Home, isActive: true },
  { title: 'Explore', icon: Compass },
  { title: 'Collections', icon: FolderOpen },
]

const toolItems = [
  { title: 'Tools', icon: Wrench },
  { title: 'Settings', icon: Settings },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Logo Hub">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center">
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <Authenticated>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton>
                <SidebarMenuButton tooltip="Sign In">
                  <LogIn />
                  <span>Sign In</span>
                </SidebarMenuButton>
              </SignInButton>
            </Unauthenticated>
            <AuthLoading>
              <Skeleton className="h-8 w-full rounded-md" />
            </AuthLoading>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
