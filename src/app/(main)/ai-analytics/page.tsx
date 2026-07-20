"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { AiAnalyticsSkeleton } from "@/components/skeletons/ai-analytics-skeleton"
import {
  BarChartIcon,
  LightningBoltIcon,
  MixIcon,
  RocketIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  CircleIcon,
  PersonIcon,
} from "@radix-ui/react-icons"
import { motion, AnimatePresence } from "motion/react"
import * as React from "react"
import { API_URL } from "@/lib/constants"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

interface DashboardItem {
  id: number
  title: string
  description: string | null
  superset_uuid: string | null
  status: string
  is_default: boolean
  created_at: string
  updated_at: string
}

interface DashboardInsight {
  dashboard_type: string
  summary: string
  key_findings: string[]
  trend: "naik" | "turun" | "stabil"
  business_recommendation: string
  potential_issue: string | null
  confidence: number
}

function TrendBadge({ trend }: { trend: DashboardInsight["trend"] }) {
  const config = {
    naik: { label: "Naik", variant: "success" as const, icon: RocketIcon },
    turun: { label: "Turun", variant: "destructive" as const, icon: CrossCircledIcon },
    stabil: { label: "Stabil", variant: "secondary" as const, icon: CircleIcon },
  }
  const { label, variant, icon: Icon } = config[trend]
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}

function InsightPanel({ insight }: { insight: DashboardInsight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Summary */}
      <Card className="border-pulse/20 bg-pulse/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-md bg-pulse/15 flex items-center justify-center shrink-0 mt-0.5">
              <LightningBoltIcon className="size-4 text-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ringkasan AI</p>
              <p className="text-sm leading-relaxed">{insight.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Temuan Utama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insight.key_findings.map((finding, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5">
              <CheckCircledIcon className="size-3.5 text-pulse mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{finding}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trend + Confidence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Tren Keseluruhan</p>
              <TrendBadge trend={insight.trend} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Confidence</p>
              <div className="flex items-center gap-3">
                <Progress value={insight.confidence * 100} className="h-2 flex-1" />
                <span className="text-xs font-mono text-muted-foreground">{Math.round(insight.confidence * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Rekomendasi Aksi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.business_recommendation}</p>
        </CardContent>
      </Card>

      {/* Potential Issue */}
      {insight.potential_issue && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <PersonIcon className="size-3 text-amber-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-amber-500 uppercase tracking-wider font-medium">Potensi Masalah</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.potential_issue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default function AiAnalyticsPage() {
  const [dashboards, setDashboards] = React.useState<DashboardItem[]>([])
  const [selectedDashboard, setSelectedDashboard] = React.useState<DashboardItem | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [insight, setInsight] = React.useState<DashboardInsight | null>(null)
  const [analyzedId, setAnalyzedId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboards`)
      const data = await res.json()
      setDashboards(data)
      if (data.length > 0) {
        setSelectedDashboard(data[0])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedDashboard) return
    setIsAnalyzing(true)
    setInsight(null)
    try {
      const res = await fetch(`${API_URL}/api/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dashboard_title: selectedDashboard.title,
          dashboard_description: selectedDashboard.description || "",
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setInsight(data)
        setAnalyzedId(selectedDashboard.id)
      }
    } catch {
      // ignore
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <PageSkeletonWrapper skeleton={<AiAnalyticsSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Analisis AI</h1>
          <p className="text-sm text-muted-foreground">
            Analisis dashboard menggunakan AI untuk mendapatkan insight bisnis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-[10px]">
            <LightningBoltIcon className="size-3" />
            Gemini 2.5 Flash
          </Badge>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Dashboard Selector */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedDashboard?.id === dashboard.id
                ? "border-pulse/50 bg-pulse/5"
                : "hover:border-muted-foreground/20"
            }`}
            onClick={() => {
              setSelectedDashboard(dashboard)
              if (analyzedId !== dashboard.id) setInsight(null)
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm">{dashboard.title}</CardTitle>
                  <CardDescription className="text-xs">{dashboard.description}</CardDescription>
                </div>
                <Badge
                  variant={dashboard.status === "active" ? "success" : "secondary"}
                  className="shrink-0"
                >
                  {dashboard.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Diperbarui {new Date(dashboard.updated_at).toLocaleDateString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content: Two Columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Dashboard Preview */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden h-full">
            <CardHeader className="border-b bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-pulse/10 flex items-center justify-center">
                    <BarChartIcon className="size-4 text-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{selectedDashboard?.title || "Pilih Dashboard"}</CardTitle>
                    <CardDescription className="text-xs">Preview dashboard</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {selectedDashboard?.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative min-h-[400px] bg-gradient-to-br from-card via-card to-muted/20 flex items-center justify-center">
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
                  <div className="size-14 rounded-2xl bg-pulse/10 border border-pulse/20 flex items-center justify-center">
                    <BarChartIcon className="size-7 text-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold">Dashboard Preview</h3>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                      Screenshot area ini akan ditangkap oleh AI saat Anda mengklik tombol Analisis AI.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    Siap dianalisis
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Insight Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-pulse/10 flex items-center justify-center">
                    <LightningBoltIcon className="size-4 text-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Insight AI</CardTitle>
                    <CardDescription className="text-xs">
                      {insight ? `Analisis: ${insight.dashboard_type}` : "Hasil analisis akan muncul di sini"}
                    </CardDescription>
                  </div>
                </div>
                {insight && analyzedId === selectedDashboard?.id && (
                  <Badge variant="success" className="text-[10px]">Selesai</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 gap-4"
                  >
                    <div className="relative">
                      <div className="size-12 rounded-full border-2 border-pulse/20 border-t-pulse animate-spin" />
                      <LightningBoltIcon className="size-5 text-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium">Menganalisis dashboard...</p>
                      <p className="text-xs text-muted-foreground">AI sedang memproses visualisasi</p>
                    </div>
                  </motion.div>
                ) : insight && analyzedId === selectedDashboard?.id ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <InsightPanel insight={insight} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 gap-4"
                  >
                    <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <MixIcon className="size-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium">Belum ada analisis</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Pilih dashboard lalu klik tombol Analisis AI untuk memulai
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Analyze Button */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <Button
          size="lg"
          className="bg-pulse hover:bg-pulse/90 text-background gap-2 px-8"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedDashboard || selectedDashboard.status === "pending"}
        >
          {isAnalyzing ? (
            <>
              <div className="size-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              <LightningBoltIcon className="size-4" />
              Analisis AI
            </>
          )}
        </Button>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5">
          <CardContent className="flex items-start gap-3 py-4">
            <PersonIcon className="size-4 text-pulse mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Catatan privasi: </span>
              Hanya screenshot dashboard yang dikirim ke AI. Data mentah tidak keluar dari sistem Anda.
              Backend menggunakan Google Gemini 2.5 Flash (free tier) via FastAPI.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
