"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeftIcon,
  PlayIcon,
  ReloadIcon,
  Pencil1Icon,
  TrashIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"

interface PipelineStep {
  id: number
  step_order: number
  name: string
  source_table: string | null
  query: string
  query_type: string
  dest_table: string | null
  execution_timeout: number | null
  retries: number | null
  retry_delay: number | null
}

interface Pipeline {
  id: number
  dag_id: string
  name: string
  description: string | null
  status: string
  last_run_at: string | null
  max_active_runs: number | null
  on_failure_callback: string | null
  schedule_interval: string | null
  steps: PipelineStep[]
  created_at: string
  updated_at: string
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-emerald-500/15 text-emerald-500",
    running: "bg-amber-500/15 text-amber-500",
    success: "bg-emerald-500/15 text-emerald-500",
    failed: "bg-red-500/15 text-red-400",
  }
  return (
    <Badge className={variants[status] || variants.draft}>
      {status}
    </Badge>
  )
}

function StatusIcon({ status }: { status: string }) {
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

export default function PipelineDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pipelineId = params.id as string

  const [pipeline, setPipeline] = React.useState<Pipeline | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [running, setRunning] = React.useState(false)
  const [runStatus, setRunStatus] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    fetchPipeline()
  }, [pipelineId])

  const fetchPipeline = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pipelines/${pipelineId}`)
      const data = await res.json()
      setPipeline(data)
    } catch {
      router.push("/pipeline")
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async () => {
    setRunning(true)
    setProgress(0)
    setRunStatus("running")
    try {
      const token = getAccessToken()
      await fetch(`${API_URL}/api/pipelines/${pipelineId}/run`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      pollStatus()
    } catch {
      setRunning(false)
      setRunStatus("failed")
    }
  }

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/pipelines/${pipelineId}/status`)
        const data = await res.json()
        setRunStatus(data.status)
        if (data.tasks_total) {
          setProgress(data.tasks_completed ? (data.tasks_completed / data.tasks_total) * 100 : 10)
        }
        if (data.status === "success" || data.status === "failed") {
          clearInterval(interval)
          setProgress(100)
          setRunning(false)
          fetchPipeline()
        }
      } catch {
        clearInterval(interval)
        setRunning(false)
      }
    }, 3000)
  }

  const handleDelete = async () => {
    setDeleteOpen(false)
    setDeleting(true)
    try {
      await fetch(`${API_URL}/api/pipelines/${pipelineId}`, { method: "DELETE" })
      router.push("/pipeline")
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-8 border-2 border-pulse/20 border-t-pulse rounded-full animate-spin" />
      </div>
    )
  }

  if (!pipeline) return null

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push("/pipeline")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{pipeline.name}</h1>
            <StatusBadge status={pipeline.status} />
          </div>
          {pipeline.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{pipeline.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/pipeline/builder?id=${pipelineId}`)}>
            <Pencil1Icon className="size-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-400 hover:text-red-400" onClick={() => setDeleteOpen(true)} disabled={deleting}>
            <TrashIcon className="size-3.5 mr-1" />
            Hapus
          </Button>
        </div>
      </div>

      <Separator />

      <Card className="border-border/60">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">DAG ID: </span>
              <span className="font-mono text-foreground">{pipeline.dag_id || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Schedule: </span>
              <span className="font-mono text-foreground">{pipeline.schedule_interval || "Manual"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Active Runs: </span>
              <span className="font-mono text-foreground">{pipeline.max_active_runs || 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {runStatus === "running" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
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

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Langkah Transformasi</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">{pipeline.steps.length} step</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pipeline.steps.map((step, index) => (
            <div key={step.id} className="border border-border/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-pulse/10 flex items-center justify-center text-xs font-bold text-pulse">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {step.query_type.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Source: </span>
                  <span className="font-mono">{step.source_table || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dest: </span>
                  <span className="font-mono">{step.dest_table || "-"}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Timeout: </span>
                  <span className="font-mono">{step.execution_timeout || 300}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Retries: </span>
                  <span className="font-mono">{step.retries || 1}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Retry Delay: </span>
                  <span className="font-mono">{step.retry_delay || 5}m</span>
                </div>
              </div>
              <div className="rounded-lg bg-background border border-border/40 p-3 overflow-x-auto">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {step.query || "(empty)"}
                </pre>
              </div>
            </div>
          ))}
          {pipeline.steps.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Belum ada langkah.{" "}
              <button className="text-pulse hover:underline" onClick={() => router.push(`/pipeline/builder?id=${pipelineId}`)}>
                Tambah step
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 pb-8">
        <Button
          className="bg-pulse hover:bg-pulse/90 text-background"
          onClick={handleRun}
          disabled={running || pipeline.steps.length === 0}
        >
          {running ? (
            <>
              <ReloadIcon className="size-3.5 mr-1.5 animate-spin" />
              Berjalan...
            </>
          ) : (
            <>
              <PlayIcon className="size-3.5 mr-1.5" />
              Jalankan Pipeline
            </>
          )}
        </Button>
      </div>
    </motion.div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Pipeline <span className="font-mono font-medium text-foreground">{pipeline.name}</span> akan dihapus permanen beserta semua langkah transformasinya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
