import Link from 'next/link'
import { Button } from "./ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Mail } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="h-[80vh] w-full relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-5xl mx-auto px-2 py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-600">
          Admit Compass - Your Digital Mentor
        </h1>
        <p className="text-neutral-700 max-w-3xl mx-auto my-6 text-xl">
          Unlock Your Path to UMBC
        </p>
        <p className="text-neutral-500 max-w-3xl mx-auto my-6 text-lg">
          Admit Compass provides students insights into their chances of admission to UMBC programs, Program Directors can use our tools to create custom rubrics, streamline reviews, and make data-driven decisions.
        </p>
        <div className="flex justify-center gap-8 mt-10">
          <div>
            <Button className="text-md py-6 px-12" size="lg" asChild variant="default">
              <Link href="/programs">
                Check Your Acceptance Score &#x2192;
              </Link>
            </Button>
          </div>
          <div>
            <SignInButton mode='modal'>
              <Button className="text-lg py-6 px-12" size="lg" variant="outline">
                  <Mail className="mr-2" /> Log in as UMBC Administrator
              </Button>
            </SignInButton>
          </div>
        </div>
        <div>
          <SignUpButton mode='modal'>
            <Button className="text-neutral-500 max-w-3xl mx-auto my-6 text-md" variant={"link"}>
                {`Don't have an account? Sign up with your UMBC Email`}
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

