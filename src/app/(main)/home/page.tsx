"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { HomeSkeleton } from "@/components/skeletons/home-skeleton"
import {
  BarChartIcon,
  ArrowRightIcon,
  RocketIcon,
  PersonIcon,
  LapTimerIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MixIcon,
  DashboardIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import Link from "next/link"
import * as React from "react"
import dynamic from "next/dynamic"
import { API_URL } from "@/lib/constants"

const ECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

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
} satisfies Variants

const pipelineChartBase = {
  backgroundColor: "transparent",
  animation: false,
  grid: { top: 12, right: 12, bottom: 24, left: 30 },
  xAxis: { type: "category", axisLine: { lineStyle: { color: "#263238" } }, axisLabel: { color: "#8a9298", fontSize: 10 } },
  yAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: "#1b2024" } }, axisLabel: { color: "#8a9298", fontSize: 10 } },
  tooltip: { trigger: "axis" },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} satisfies Variants

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

interface ControlTower {
  pipeline_health: Record<string, number>
  mart_freshness: { table_name: string; row_count: number; last_built_at: string | null; freshness: "fresh" | "stale" | "never_built" }[]
  impacted_dashboards: { title: string; issue_count: number }[]
  failed_pipelines: { name: string; status: string; last_run_at: string | null }[]
  data_quality_issues: { table_name: string; issue: string; row_count: number }[]
  ai_readiness: {
    ready: boolean
    checks: { label: string; passed: boolean }[]
    dashboard_total: number
    dashboard_configured: number
  }
}

interface HomeData {
  stats: Record<string, { value: number | string; label: string }>
  activities: Activity[]
  control_tower: ControlTower
}

const ARCHITECTURE_STEPS = [
  { label: "Data CSV", sub: "Dataset CSV" },
  { label: "Lapisan Mentah", sub: "PostgreSQL" },
  { label: "DAG Airflow", sub: "Pipeline ETL" },
  { label: "Data Mart", sub: "Teragregasi" },
  { label: "Superset", sub: "Dashboard" },
  { label: "Aplikasi Web", sub: "Next.js" },
]

const QUICK_ACCESS = [
  { title: "Data Overview", desc: "Distribusi & tren data", href: "/dashboard", color: "pulse" },
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

  async function fetchData() {
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

  React.useEffect(() => {
    const timer = window.setTimeout(() => { void fetchData() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse"><MixIcon className="size-3" />Operational overview</div>
          <h1 className="text-3xl font-semibold tracking-tight">Ringkasan</h1>
          <p className="text-sm text-muted-foreground">Kondisi data, pipeline, dan kesiapan insight dalam satu layar.</p>
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
            <Card key={stat.label} className="relative overflow-hidden rounded-lg border-border shadow-none group">
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
                <div className="absolute inset-x-0 bottom-0 h-px bg-pulse/40 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />
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

      {/* Control Tower */}
      {data?.control_tower && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Control Tower</h2>
              <p className="mt-1 text-xs text-muted-foreground">Satu layar untuk health pipeline, kesiapan insight, dan dampak data.</p>
            </div>
            <Badge variant={data.control_tower.ai_readiness.ready ? "success" : "warning"} className="shrink-0 gap-1.5">
              <span className={`size-1.5 rounded-full ${data.control_tower.ai_readiness.ready ? "bg-emerald-500" : "bg-amber-500"}`} />
              AI {data.control_tower.ai_readiness.ready ? "ready" : "limited"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1.85fr]">
            <Card className="overflow-hidden rounded-lg border-pulse/20 bg-pulse/[0.03] shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Pipeline health</CardTitle>
                    <CardDescription className="text-xs">Status workflow terakhir</CardDescription>
                  </div>
                  <RocketIcon className="size-4 text-pulse" />
                </div>
              </CardHeader>
              <CardContent>

                <div className="mt-4 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dashboard terhubung</span>
                    <span className="font-mono font-medium">{data.control_tower.ai_readiness.dashboard_configured}/{data.control_tower.ai_readiness.dashboard_total}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {data.control_tower.ai_readiness.checks.map((check) => (
                      <span key={check.label} title={check.label} className={check.passed ? "text-emerald-500" : "text-amber-500"}>
                        {check.passed ? <CheckCircledIcon className="size-4" /> : <CrossCircledIcon className="size-4" />}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">quality checks</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border/50 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div><p className="text-xs font-medium">Pipeline distribution</p><p className="text-[10px] text-muted-foreground">Status dari seluruh pipeline terdaftar</p></div>
                    <BarChartIcon className="size-4 text-pulse" />
                  </div>
                  <ECharts
                    option={{
                      ...pipelineChartBase,
                      color: ["#10b981", "#f59e0b", "#ef4444"],
                      xAxis: { ...pipelineChartBase.xAxis, data: ["Sukses", "Berjalan", "Gagal"] },
                      series: [{ type: "bar", barMaxWidth: 28, data: [data.control_tower.pipeline_health.success || 0, data.control_tower.pipeline_health.running || 0, data.control_tower.pipeline_health.failed || 0], itemStyle: { borderRadius: [3, 3, 0, 0] } }],
                    }}
                    style={{ height: 150, width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Mart freshness</CardTitle></CardHeader>
                <CardContent>
                  {data.control_tower.mart_freshness.length > 0 ? data.control_tower.mart_freshness.slice(0, 3).map((mart) => (
                    <div key={mart.table_name} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
                      <span className="min-w-0 truncate font-mono text-[11px]">{mart.table_name}</span>
                      <Badge variant={mart.freshness === "fresh" ? "success" : mart.freshness === "stale" ? "warning" : "destructive"} className="ml-2 text-[9px]">{mart.freshness}</Badge>
                    </div>
                  )) : <p className="py-2 text-xs text-muted-foreground">Belum ada mart terdaftar.</p>}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Dashboard terdampak</CardTitle></CardHeader>
                <CardContent>
                  {data.control_tower.impacted_dashboards.length > 0 ? data.control_tower.impacted_dashboards.slice(0, 3).map((dashboard, index) => (
                    <div key={`${dashboard.title}-${index}`} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
                      <span className="min-w-0 truncate text-xs">{dashboard.title}</span>
                      <span className="ml-2 font-mono text-[10px] text-amber-500">{dashboard.issue_count} issue</span>
                    </div>
                  )) : <p className="py-2 text-xs text-emerald-500">Tidak ada dashboard terdampak.</p>}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Failed pipeline</CardTitle></CardHeader>
                <CardContent>
                  {data.control_tower.failed_pipelines.length > 0 ? data.control_tower.failed_pipelines.slice(0, 3).map((pipeline, index) => (
                    <div key={`${pipeline.name}-${pipeline.last_run_at || "unknown"}-${index}`} className="flex items-center gap-2 border-b border-border/40 py-2 last:border-0">
                      <span className="size-1.5 shrink-0 rounded-full bg-red-400" />
                      <span className="truncate text-xs">{pipeline.name}</span>
                    </div>
                  )) : <p className="py-2 text-xs text-emerald-500">Tidak ada pipeline gagal.</p>}
                </CardContent>
              </Card>

              <Card className="rounded-lg border-border/50 shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Data quality</CardTitle><CardDescription className="text-xs">Check quality, bukan freshness</CardDescription></CardHeader>
                <CardContent>
                  {data.control_tower.data_quality_issues.length > 0 ? data.control_tower.data_quality_issues.slice(0, 3).map((issue, index) => (
                    <div key={`${issue.table_name}-${index}`} className="border-b border-border/40 py-2 last:border-0">
                      <p className="truncate font-mono text-[11px]">{issue.table_name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-amber-500">{issue.issue}</p>
                    </div>
                  )) : <p className="py-2 text-xs text-emerald-500">Tidak ada issue quality.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}

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
