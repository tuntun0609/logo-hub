import { cookies } from 'next/headers'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export async function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar_state')
  const defaultOpen = sidebarState ? sidebarState.value === 'true' : true

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <span className="text-muted-foreground text-sm">Home</span>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
