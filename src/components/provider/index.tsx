import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import ConvexClientProvider from './convex-provider'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}
