import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <div>
      <header className="flex h-16 items-center justify-end gap-4 p-4">
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton>
            <button
              className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 font-medium text-sm text-white sm:h-12 sm:px-5 sm:text-base"
              type="button"
            >
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
      <ThemeToggle />
    </div>
  )
}
