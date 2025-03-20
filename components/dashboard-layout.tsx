"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const isClient = user?.user_type === "client"
  const isFreelancer = user?.user_type === "freelancer"

  const baseRoute = isClient ? "/client" : "/freelancer"

  const navigation = [
    {
      name: "Dashboard",
      href: `${baseRoute}/dashboard`,
      icon: Home,
      current: pathname === `${baseRoute}/dashboard`,
    },
    {
      name: "Jobs",
      href: isClient ? `${baseRoute}/jobs` : "/jobs",
      icon: Briefcase,
      current: pathname.includes("/jobs"),
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      current: pathname.includes("/messages"),
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      current: pathname === "/notifications",
    },
    ...(isClient
      ? [
          {
            name: "Proposals",
            href: `${baseRoute}/proposals`,
            icon: Building2,
            current: pathname.includes("/proposals"),
          },
        ]
      : []),
    ...(isFreelancer
      ? [
          {
            name: "My Proposals",
            href: `${baseRoute}/proposals`,
            icon: Building2,
            current: pathname.includes("/proposals"),
          },
        ]
      : []),
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
      current: pathname.includes("/payments"),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/"
                className="flex h-10 items-center justify-start rounded-lg px-4 hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <span className="font-bold">Freelance Platform</span>
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center justify-start rounded-lg px-4 hover:bg-accent",
                    item.current && "bg-accent",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="hidden md:flex">
          <span className="text-xl font-bold">Freelance Platform</span>
        </Link>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline-flex">
                {user?.first_name} {user?.last_name}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem onClick={() => router.push("/profile")}> */}
            <DropdownMenuItem onClick={() => router.push(`${baseRoute}/profile`)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-10 items-center justify-start rounded-lg px-4 hover:bg-accent",
                  item.current && "bg-accent",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

