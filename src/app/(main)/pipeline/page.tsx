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

const dags = [
  {
    id: "oulad_etl",
    name: "OULAD ETL Pipeline",
    description: "Extract OULAD CSV → Transform → Load to data mart",
    schedule: "@daily",
    lastRun: "2026-07-19 06:00",
    lastStatus: "success" as PipelineStatus,
    tasks: 4,
    duration: "1m 32s",
  },
  {
    id: "oulad_validate",
    name: "Data Validation",
    description: "Validate raw data integrity & schema checks",
    schedule: "@daily",
    lastRun: "2026-07-19 06:02",
    lastStatus: "success" as PipelineStatus,
    tasks: 3,
    duration: "45s",
  },
  {
    id: "oulad_refresh_mart",
    name: "Mart Refresh",
    description: "Refresh aggregated data mart tables",
    schedule: "Manual",
    lastRun: "2026-07-18 14:30",
    lastStatus: "success" as PipelineStatus,
    tasks: 2,
    duration: "28s",
  },
]

const runHistory = [
  { dag: "oulad_etl", run: "manual__2026-07-19T06:00:00", status: "success", duration: "1m 32s", tasks: "4/4" },
  { dag: "oulad_validate", run: "manual__2026-07-19T06:02:00", status: "success", duration: "45s", tasks: "3/3" },
  { dag: "oulad_etl", run: "scheduled__2026-07-18T06:00:00", status: "success", duration: "1m 28s", tasks: "4/4" },
  { dag: "oulad_etl", run: "scheduled__2026-07-17T06:00:00", status: "failed", duration: "32s", tasks: "1/4" },
  { dag: "oulad_refresh_mart", run: "manual__2026-07-18T14:30:00", status: "success", duration: "28s", tasks: "2/2" },
]

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

  const handleTrigger = () => {
    setPipelineStatus("running")
    setProgress(0)

    // Simulate pipeline progress
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
          onClick={handleTrigger}
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
        {dags.map((dag) => (
          <Card key={dag.id} className="group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-mono">{dag.name}</CardTitle>
                  <CardDescription className="text-xs">{dag.description}</CardDescription>
                </div>
                <StatusIcon status={dag.lastStatus} />
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
                  <p className="font-mono">{dag.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Run Terakhir</p>
                  <p className="font-mono text-[10px]">{dag.lastRun}</p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleTrigger}
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
        ))}
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
              <Button variant="ghost" size="sm">
                <ReloadIcon className="size-3.5 mr-1.5" />
                Segarkan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {runHistory.map((run, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <StatusIcon status={run.status as PipelineStatus} />
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium font-mono truncate">{run.dag}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-mono truncate">{run.run}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground font-mono">{run.duration}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground font-mono">{run.tasks} tugas</p>
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
