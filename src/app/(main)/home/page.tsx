"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { HomeSkeleton } from "@/components/skeletons/home-skeleton"
import {
  BarChartIcon,
  LightningBoltIcon,
  RocketIcon,
  TableIcon,
  DashboardIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  LapTimerIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import Link from "next/link"
import * as React from "react"
import { API_URL } from "@/lib/constants"
import { getCurrentUser } from "@/lib/auth"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} satisfies Variants

interface HomeData {
  stats: {
    pipelines: { value: number; label: string }
    active: { value: number; label: string }
    dashboards: { value: number; label: string }
    domains: { value: number; label: string }
    success_rate: { value: string; label: string }
  }
  activities: Array<{ action: string; status: string; created_at: string }>
  control_tower: {
    pipeline_health: Record<string, number>
    mart_freshness: Array<{ table_name: string; row_count: number; last_built_at: string | null; freshness: string }>
    impacted_dashboards: Array<{ title: string; issue_count: number }>
    failed_pipelines: Array<{ name: string; status: string; last_run_at: string | null }>
    data_quality_issues: Array<{ table_name: string; issue: string; row_count: number }>
    ai_readiness: {
      ready: boolean
      checks: Array<{ label: string; passed: boolean }>
      dashboard_total: number
      dashboard_configured: number
    }
  }
}

function AdminHome({ data }: { data: HomeData }) {
  const { stats, control_tower, activities } = data
  const martFreshness = control_tower?.mart_freshness || []
  const failedPipelines = control_tower?.failed_pipelines || []
  const qualityIssues = control_tower?.data_quality_issues || []

  return (
    <>
      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.16em]">Pipeline</CardDescription>
              <RocketIcon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tighter font-mono">{stats.pipelines.value}</span>
            <p className="text-xs text-muted-foreground mt-1">{stats.pipelines.label}</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.16em]">Berjalan</CardDescription>
              <LapTimerIcon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tighter font-mono">{stats.active.value}</span>
            <p className="text-xs text-muted-foreground mt-1">{stats.active.label}</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.16em]">Dashboard</CardDescription>
              <BarChartIcon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tighter font-mono">{stats.dashboards.value}</span>
            <p className="text-xs text-muted-foreground mt-1">{stats.dashboards.label}</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.16em]">Success Rate</CardDescription>
              <CheckCircledIcon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tighter font-mono">{stats.success_rate.value}</span>
            <p className="text-xs text-muted-foreground mt-1">{stats.success_rate.label}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Access */}
      <motion.div variants={itemVariants}>
        <h2 className="text-base font-semibold tracking-tight mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/dashboard" className="block group">
            <Card className="h-full hover:border-pulse/40 hover:bg-accent/50 transition-all duration-300 rounded-lg border-border shadow-none">
              <CardContent className="p-4">
                <div className="size-10 rounded-lg bg-pulse/10 flex items-center justify-center mb-3 group-hover:bg-pulse/20 transition-colors">
                  <BarChartIcon className="size-5 text-pulse" />
                </div>
                <p className="text-sm font-medium">Analitik</p>
                <p className="text-[10px] text-muted-foreground">Dashboard Superset</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-analytics" className="block group">
            <Card className="h-full hover:border-emerald-500/40 hover:bg-accent/50 transition-all duration-300 rounded-lg border-border shadow-none">
              <CardContent className="p-4">
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                  <LightningBoltIcon className="size-5 text-emerald-500" />
                </div>
                <p className="text-sm font-medium">Analisis AI</p>
                <p className="text-[10px] text-muted-foreground">Chat dengan data</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/datasets" className="block group">
            <Card className="h-full hover:border-sky-500/40 hover:bg-accent/50 transition-all duration-300 rounded-lg border-border shadow-none">
              <CardContent className="p-4">
                <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center mb-3 group-hover:bg-sky-500/20 transition-colors">
                  <TableIcon className="size-5 text-sky-500" />
                </div>
                <p className="text-sm font-medium">Dataset</p>
                <p className="text-[10px] text-muted-foreground">Kelola data</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pipeline" className="block group">
            <Card className="h-full hover:border-amber-500/40 hover:bg-accent/50 transition-all duration-300 rounded-lg border-border shadow-none">
              <CardContent className="p-4">
                <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                  <RocketIcon className="size-5 text-amber-500" />
                </div>
                <p className="text-sm font-medium">Pipeline</p>
                <p className="text-[10px] text-muted-foreground">Orkestrasi data</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Control Tower */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Failed Pipelines */}
        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CrossCircledIcon className="size-4 text-red-500" />
              Pipeline Gagal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {failedPipelines.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada pipeline gagal</p>
            ) : (
              <div className="space-y-2">
                {failedPipelines.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">{p.name}</span>
                    <Badge variant="destructive" className="text-[10px]">Gagal</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quality Issues */}
        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircledIcon className="size-4 text-amber-500" />
              Quality Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {qualityIssues.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada issue kualitas</p>
            ) : (
              <div className="space-y-2">
                {qualityIssues.map((q, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">{q.table_name}</span>
                    <Badge variant="outline" className="text-[10px]">{q.issue}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mart Freshness */}
        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TableIcon className="size-4 text-pulse" />
              Mart Freshness
            </CardTitle>
          </CardHeader>
          <CardContent>
            {martFreshness.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada data mart</p>
            ) : (
              <div className="space-y-2">
                {martFreshness.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">{m.table_name}</span>
                    <div className={`size-2 rounded-full ${
                      m.freshness === "fresh" ? "bg-emerald-500" :
                      m.freshness === "stale" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Readiness */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <LightningBoltIcon className="size-4 text-emerald-500" />
              AI Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {control_tower?.ai_readiness?.checks?.map((check, i) => (
                <div key={i} className="flex items-center gap-2">
                  {check.passed ? (
                    <CheckCircledIcon className="size-4 text-emerald-500" />
                  ) : (
                    <CrossCircledIcon className="size-4 text-red-500" />
                  )}
                  <span className="text-xs">{check.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="rounded-lg border-border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activities.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">{a.action}</span>
                    <Badge variant={a.status === "success" ? "default" : "destructive"} className="text-[10px]">
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  )
}

function ViewerHome({ data }: { data: HomeData | null }) {
  return (
    <>
      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.16em]">Domain</CardDescription>
              <TableIcon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tighter font-mono">{data?.stats.domains || 0}</span>
            <p className="text-xs text-muted-foreground mt-1">domain terdaftar</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.16em]">Dashboard</CardDescription>
              <BarChartIcon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tighter font-mono">{data?.stats.dashboards.value || 0}</span>
            <p className="text-xs text-muted-foreground mt-1">dashboard aktif</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Access */}
      <motion.div variants={itemVariants}>
        <h2 className="text-base font-semibold tracking-tight mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard" className="block group">
            <Card className="h-full hover:border-pulse/40 hover:bg-accent/50 transition-all duration-300 rounded-lg border-border shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-pulse/10 flex items-center justify-center group-hover:bg-pulse/20 transition-colors">
                    <BarChartIcon className="size-6 text-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Dashboard Analitik</CardTitle>
                    <CardDescription className="text-xs">
                      Visualisasi data melalui dashboard Superset
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/ai-analytics" className="block group">
            <Card className="h-full hover:border-emerald-500/40 hover:bg-accent/50 transition-all duration-300 rounded-lg border-border shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <LightningBoltIcon className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Analisis AI</CardTitle>
                    <CardDescription className="text-xs">
                      Tanya jawab dengan data menggunakan AI Gemini
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </motion.div>
    </>
  )
}

export default function HomePage() {
  const user = getCurrentUser()
  const isAdmin = user?.role === "admin" || user?.role === "editor"
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

  return (
    <PageSkeletonWrapper skeleton={<HomeSkeleton />}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2 border-b border-border pb-5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse">
            <RocketIcon className="size-3" />Selamat datang
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Ringkasan</h1>
          <p className="text-sm text-muted-foreground">Pantau kondisi data dan akses analitik EduPulse.</p>
        </motion.div>

        {isAdmin ? <AdminHome data={data!} /> : <ViewerHome data={data} />}
      </motion.div>
    </PageSkeletonWrapper>
  )
}
