"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DashboardIcon,
  BarChartIcon,
  RocketIcon,
  GearIcon,
  FileTextIcon,
  LightningBoltIcon,
  TableIcon,
  LoopIcon,
  GlobeIcon,
} from "@radix-ui/react-icons"
import { Separator } from "@/components/ui/separator"
import { DomainSwitcher } from "./domain-switcher"

const navItems = [
  {
    label: "Ringkasan",
    href: "/home",
    icon: DashboardIcon,
  },
  {
    label: "Analitik",
    href: "/dashboard",
    icon: BarChartIcon,
  },
  {
    label: "Analisis AI",
    href: "/ai-analytics",
    icon: LightningBoltIcon,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: RocketIcon,
  },
  {
    label: "Dataset",
    href: "/datasets",
    icon: TableIcon,
  },
  {
    label: "Alur Data",
    href: "/lineage",
    icon: LoopIcon,
  },
  {
    label: "Domain",
    href: "/domains",
    icon: GlobeIcon,
  },
  {
    label: "Dokumentasi",
    href: "/docs",
    icon: FileTextIcon,
  },
  {
    label: "Pengaturan",
    href: "/settings",
    icon: GearIcon,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r bg-card/50 backdrop-blur-sm shrink-0 h-full sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b shrink-0">
        <img
          src="/logo/edupulse-logo.png"
          alt="EduPulse Logo"
          className="h-8 w-auto object-contain"
        />
        <span className="text-sm font-semibold tracking-tight">EduPulse</span>
      </div>

      <div className="px-3 pt-3 pb-1 shrink-0">
        <DomainSwitcher />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-pulse/10 text-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
              {isActive && (
                <div className="ml-auto size-1.5 rounded-full bg-pulse animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4 shrink-0">
        <Separator className="mb-3" />
        <div className="px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Status Pipeline</p>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Semua sistem beroperasi</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
