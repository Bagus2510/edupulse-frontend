"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { HomeSkeleton } from "@/components/skeletons/home-skeleton"
import {
  BarChartIcon,
  RocketIcon,
  PersonIcon,
  LapTimerIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MixIcon,
  DashboardIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import Link from "next/link"
import * as React from "react"
import { API_URL } from "@/lib/constants"

const iconMap = { PersonIcon, DashboardIcon, BarChartIcon, LapTimerIcon } as const
const colorMap = {
  "pulse": { bg: "bg-pulse/10", hover: "group-hover:bg-pulse/20", text: "text-pulse", icon: "text-pulse" },
  "amber-500": { bg: "bg-amber-500/10", hover: "group-hover:bg-amber-500/20", text: "text-amber-500", icon: "text-amber-500" },
  "emerald-500": { bg: "bg-emerald-500/10", hover: "group-hover:bg-emerald-500/20", text: "text-emerald-500", icon: "text-emerald-500" },
} as const

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

interface Stat {
  label: string
  value: string
  icon: string
}

interface Activity {
  action: string
  status: string
  created_at: string
}

interface HomeData {
  stats: Record<string, { value: number | string; label: string }>
  activities: Activity[]
}

const ARCHITECTURE_STEPS = [
  { label: "Data CSV", sub: "Dataset OULAD" },
  { label: "Lapisan Mentah", sub: "PostgreSQL" },
  { label: "DAG Airflow", sub: "Pipeline ETL" },
  { label: "Data Mart", sub: "Teragregasi" },
  { label: "Superset", sub: "Dashboard" },
  { label: "Aplikasi Web", sub: "Next.js" },
]

const QUICK_ACCESS = [
  { title: "Performa Mahasiswa", desc: "Distribusi nilai & tren", href: "/dashboard", color: "pulse" },
  { title: "Pipeline ETL", desc: "Kelola pipeline transformasi", href: "/pipeline", color: "amber-500" },
  { title: "Analisis AI", desc: "Insight berbasis Gemini", href: "/ai-analytics", color: "emerald-500" },
]

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Baru saja"
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay} hari lalu`
}

export default function HomePage() {
  const [data, setData] = React.useState<HomeData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/home/summary`)
      const json = await res.json()
      setData(json)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const statIcons: Record<string, string> = {
    pipelines: "DashboardIcon",
    active: "LapTimerIcon",
    dashboards: "BarChartIcon",
    success_rate: "PersonIcon",
  }

  const stats: Stat[] = data
    ? Object.entries(data.stats).map(([key, val]) => ({
        label: val.label,
        value: String(val.value),
        icon: statIcons[key] || "DashboardIcon",
      }))
    : []

  return (
    <PageSkeletonWrapper skeleton={<HomeSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Hero Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-pulse/10 border border-pulse/20">
            <MixIcon className="size-5 text-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ringkasan</h1>
            <p className="text-sm text-muted-foreground">
              Analitik akademik dalam sekilas
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon as keyof typeof iconMap]
          return (
            <Card key={stat.label} className="relative overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[11px] uppercase tracking-widest">
                    {stat.label}
                  </CardDescription>
                  {Icon && <Icon className="size-4 text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tighter font-mono">
                    {stat.value}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pulse/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Architecture Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Arsitektur</CardTitle>
              <CardDescription>Alur data platform</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="relative">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {ARCHITECTURE_STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-card/50 hover:border-pulse/30 transition-colors min-w-0">
                        <div className="size-7 rounded-md bg-pulse/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-pulse font-mono">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium truncate">{step.label}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{step.sub}</span>
                        </div>
                      </div>
                      {i < ARCHITECTURE_STEPS.length - 1 && (
                        <div className="text-muted-foreground/40 shrink-0">
                          <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                            <path
                              d="M0 3H14M14 3L11 0.5M14 3L11 5.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Aktivitas Terkini</CardTitle>
              <CardDescription>Log aktivitas terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data?.activities || []).map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 relative">
                      <div
                        className={`size-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-emerald-500"
                            : "bg-amber-500 animate-pulse"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                    <Badge
                      variant={activity.status === "success" ? "success" : "warning"}
                      className="shrink-0"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
                {(!data?.activities || data.activities.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">Belum ada aktivitas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Access Cards */}
      <motion.div variants={itemVariants}>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {QUICK_ACCESS.map((item) => {
            const c = colorMap[item.color as keyof typeof colorMap]
            const quickIcons = [BarChartIcon, RocketIcon, LapTimerIcon]
            const qi = QUICK_ACCESS.indexOf(item)
            const QIcon = quickIcons[qi]
            return (
              <Link key={item.title} href={item.href} className="block">
                <Card className="group cursor-pointer hover:border-pulse/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-lg ${c.bg} flex items-center justify-center ${c.hover} transition-colors`}>
                        <QIcon className={`size-5 ${c.icon}`} />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{item.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {item.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
