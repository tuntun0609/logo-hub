'use client'

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <div>
      <header className="flex h-16 items-center justify-end gap-4 p-4">
        <Unauthenticated>
          <SignInButton />
          <SignUpButton>
            <button
              className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 font-medium text-sm text-white sm:h-12 sm:px-5 sm:text-base"
              type="button"
            >
              Sign Up
            </button>
          </SignUpButton>
        </Unauthenticated>
        <Authenticated>
          <UserButton />
        </Authenticated>
        <AuthLoading>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </AuthLoading>
      </header>
      <ThemeToggle />
    </div>
  )
}
