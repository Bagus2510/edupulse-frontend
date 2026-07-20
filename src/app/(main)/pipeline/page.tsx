"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { PipelineSkeleton } from "@/components/skeletons/pipeline-skeleton"
import {
  RocketIcon,
  ReloadIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  LightningBoltIcon,
  PlayIcon,
  SquareIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
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

type PipelineStatus = "idle" | "running" | "success" | "failed"

interface PipelineRun {
  id: number
  dag_id: string
  run_id: string | null
  status: PipelineStatus
  duration: string | null
  tasks_total: number | null
  tasks_completed: number | null
  created_at: string
}

function StatusIcon({ status }: { status: PipelineStatus }) {
  switch (status) {
    case "success":
      return <CheckCircledIcon className="size-4 text-emerald-500" />
    case "failed":
      return <CrossCircledIcon className="size-4 text-red-400" />
    case "running":
      return <ReloadIcon className="size-4 text-amber-500 animate-spin" />
    default:
      return <ClockIcon className="size-4 text-muted-foreground" />
  }
}

export default function PipelinePage() {
  const [pipelineStatus, setPipelineStatus] = React.useState<PipelineStatus>("idle")
  const [progress, setProgress] = React.useState(0)
  const [runs, setRuns] = React.useState<PipelineRun[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pipeline/runs`)
      const data = await res.json()
      setRuns(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleTrigger = async (dagId: string = "oulad_etl") => {
    setPipelineStatus("running")
    setProgress(0)
    try {
      await fetch(`${API_URL}/api/pipeline/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dag_id: dagId }),
      })
      await fetchRuns()
    } catch {
      // ignore
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setPipelineStatus("success")
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)
  }

  return (
    <PageSkeletonWrapper skeleton={<PipelineSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kontrol Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Pantau dan jalankan run DAG Airflow
          </p>
        </div>
        <Button
          onClick={() => handleTrigger()}
          disabled={pipelineStatus === "running"}
          className="bg-pulse hover:bg-pulse/90 text-background"
        >
          {pipelineStatus === "running" ? (
            <>
              <ReloadIcon className="size-3.5 mr-1.5 animate-spin" />
              Berjalan...
            </>
          ) : (
            <>
              <PlayIcon className="size-3.5 mr-1.5" />
              Segarkan Data
            </>
          )}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Pipeline Status */}
      {pipelineStatus === "running" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <LightningBoltIcon className="size-5 text-amber-500 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Pipeline berjalan...</p>
                    <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* DAG Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "oulad_etl", name: "OULAD ETL Pipeline", description: "Extract OULAD CSV → Transform → Load to data mart", schedule: "@daily", tasks: 4 },
          { id: "oulad_validate", name: "Data Validation", description: "Validate raw data integrity & schema checks", schedule: "@daily", tasks: 3 },
          { id: "oulad_refresh_mart", name: "Mart Refresh", description: "Refresh aggregated data mart tables", schedule: "Manual", tasks: 2 },
        ].map((dag) => {
          const lastRun = runs.find((r) => r.dag_id === dag.id)
          return (
            <Card key={dag.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-mono">{dag.name}</CardTitle>
                    <CardDescription className="text-xs">{dag.description}</CardDescription>
                  </div>
                  <StatusIcon status={lastRun?.status || "idle"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Jadwal</p>
                    <p className="font-mono">{dag.schedule}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Tugas</p>
                    <p className="font-mono">{dag.tasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Durasi</p>
                    <p className="font-mono">{lastRun?.duration || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Run Terakhir</p>
                    <p className="font-mono text-[10px]">{lastRun ? new Date(lastRun.created_at).toLocaleString("id-ID") : "-"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTrigger(dag.id)}
                    disabled={pipelineStatus === "running"}
                  >
                    <PlayIcon className="size-3 mr-1" />
                    Jalankan
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0">
                    <SquareIcon className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Run History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Riwayat Run</CardTitle>
                <CardDescription>Log eksekusi DAG terbaru</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchRuns}>
                <ReloadIcon className="size-3.5 mr-1.5" />
                Segarkan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {runs.map((run) => (
                <div key={run.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <StatusIcon status={run.status} />
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium font-mono truncate">{run.dag_id}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-mono truncate">{run.run_id || "-"}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground font-mono">{run.duration || "-"}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground font-mono">{run.tasks_completed}/{run.tasks_total} tugas</p>
                    </div>
                  </div>
                  <Badge
                    variant={run.status === "success" ? "success" : "destructive"}
                    className="shrink-0"
                  >
                    {run.status}
                  </Badge>
                </div>
              ))}
              {runs.length === 0 && !loading && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  Belum ada riwayat run
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5">
          <CardContent className="flex items-start gap-3 py-4">
            <RocketIcon className="size-4 text-pulse mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Catatan integrasi: </span>
              Trigger DAG dan status polling terhubung ke REST API Airflow melalui backend FastAPI.
              Lihat endpoint <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">POST /api/airflow/dags/&#123;dag_id&#125;/trigger</code>.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
