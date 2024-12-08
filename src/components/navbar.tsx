import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export function Navbar() {
  return (
    <nav>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Admit Compass
          </Link>
          <div className="flex space-x-4">
            <Button variant="ghost" size="lg">
              <Link href="/programs">
                Programs
              </Link>
            </Button>
            <SignedOut>
              <SignInButton mode='modal'>
                  <Button variant="ghost" size="lg">
                    Log in
                  </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}

