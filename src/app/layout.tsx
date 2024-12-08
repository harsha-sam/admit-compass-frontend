import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs"
import { SidebarNav } from '@/components/sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Admit Compass",
  description: "Advanced admission management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <SignedIn>
              <SidebarProvider>
                <div className="flex w-screen">
                  <SidebarNav />
                  <SidebarInset>
                    <main className="flex flex-1 overflow-y-auto p-4">
                      <SidebarTrigger />
                      {children}
                    </main>
                  </SidebarInset>
                </div>
              </SidebarProvider>
          </SignedIn>
          <SignedOut>
            <main className="p-4">
              <Navbar />
                {children}
            </main>
          </SignedOut>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
