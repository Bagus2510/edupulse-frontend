"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DashboardIcon,
  BarChartIcon,
  RocketIcon,
  GearIcon,
  MixIcon,
  HamburgerMenuIcon,
  FileTextIcon,
  PersonIcon,
  LockClosedIcon,
  LightningBoltIcon,
  TableIcon,
  LoopIcon,
  GlobeIcon,
} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import * as React from "react"
import { clearAuth, getCurrentUser } from "@/lib/auth"
import { DomainSwitcher } from "./domain-switcher"
import { useDomain } from "@/lib/domain-context"

const navItems = [
  { label: "Ringkasan", href: "/home", icon: DashboardIcon },
  { label: "Analitik", href: "/dashboard", icon: BarChartIcon },
  { label: "Analisis AI", href: "/ai-analytics", icon: LightningBoltIcon },
  { label: "Pipeline", href: "/pipeline", icon: RocketIcon },
  { label: "Dataset", href: "/datasets", icon: TableIcon },
  { label: "Alur Data", href: "/lineage", icon: LoopIcon },
  { label: "Domain", href: "/domains", icon: GlobeIcon },
  { label: "Dokumentasi", href: "/docs", icon: FileTextIcon },
  { label: "Pengaturan", href: "/settings", icon: GearIcon },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const user = getCurrentUser()
  const { activeDomainId } = useDomain()

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:px-6 shrink-0">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden cursor-pointer">
            <HamburgerMenuIcon className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <div className="flex items-center justify-center px-5 h-16 border-b">
            <img
              src="/logo/edupulse-logo.png"
              alt="EduPulse Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="px-3 pt-3 pb-1">
            <DomainSwitcher />
          </div>
          <nav className="px-3 py-4 space-y-1">
            {navItems
              .filter((item) => !(activeDomainId !== null && item.href === "/domains"))
              .map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-pulse/10 text-pulse"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8 rounded-full cursor-pointer">
              <div className="size-8 rounded-full bg-gradient-to-br from-pulse/80 to-pulse flex items-center justify-center text-xs font-bold text-background">
                {user?.avatar_initial || "A"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.full_name || "Admin"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault()
                  setProfileOpen(true)
                }}
              >
                <PersonIcon className="size-4 mr-2" />
                Profil
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/docs">
                <FileTextIcon className="size-4 mr-2" />
                Dokumentasi
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil Pengguna</DialogTitle>
            <DialogDescription>Informasi akun Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-gradient-to-br from-pulse/80 to-pulse flex items-center justify-center text-lg font-bold text-background">
                {user?.avatar_initial || "A"}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.full_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "admin@edupulse.dev"}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <PersonIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Peran</span>
                </div>
                <span className="text-sm font-medium capitalize">{user?.role || "admin"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Status</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-medium">Aktif</span>
              </div>
            </div>
            <Separator />
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleLogout}
            >
              Keluar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
