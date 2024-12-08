"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ClipboardList, FileSpreadsheet, Database, FolderTree, GraduationCap, BookCheck } from 'lucide-react'

const sidebarItems = [
  { title: "Programs", href: "/programs", icon: GraduationCap },
  { title: "Rulesets", href: "/rulesets", icon: FileSpreadsheet },
  {
    title: "Attributes",
    icon: ClipboardList,
    children: [
      { title: "Attribute Categories", href: "/attribute-categories", icon: FolderTree },
      { title: "Manage Attributes", href: "/attributes", icon: Database },
    ],
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="flex mb-8 mt-2 px-4">
        <Link href="/" className="flex space-x-2">
          <span className="text-xl font-bold">Admit Compass</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)] w-full">
          <SidebarMenu className="w-full p-0">
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.title} className="w-full">
                {item.children ? (
                  <SidebarGroup>
                    <SidebarGroupLabel className="px-4 py-2">{item.title}</SidebarGroupLabel>
                    <SidebarGroupContent className="w-full">
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.href} className="w-full">
                          <SidebarMenuButton asChild isActive={pathname === child.href} className="w-full px-4 py-2">
                            <Link href={child.href} className="flex items-center">
                              <child.icon className="h-4 w-4 mr-2" />
                              {child.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarGroupContent>
                  </SidebarGroup>
                ) : (
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full px-4 py-2">
                    <Link href={item.href!} className="flex items-center">
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="px-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

