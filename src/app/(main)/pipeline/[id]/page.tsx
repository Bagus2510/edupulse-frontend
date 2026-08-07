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
  PersonIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import { toast } from "sonner"
import { API_URL } from "@/lib/constants"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"
import { PipelineDetailSkeleton } from "@/components/skeletons/pipeline-detail-skeleton"

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

interface PipelineRun {
  id: number
  dag_id: string
  run_id: string | null
  status: string
  duration: string | null
  duration_ms: number | null
  tasks_total: number | null
  tasks_completed: number | null
  rows_read: number | null
  rows_written: number | null
  quality_status: string | null
  quality_summary: Record<string, unknown> | null
  error_message: string | null
  triggered_by: number | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-emerald-500/15 text-emerald-500",
    running: "bg-amber-500/15 text-amber-500",
    queued: "bg-slate-400/15 text-slate-400",
    success: "bg-emerald-500/15 text-emerald-500",
    failed: "bg-red-500/15 text-red-400",
    idle: "bg-muted text-muted-foreground",
    unknown: "bg-muted text-muted-foreground",
    warning: "bg-amber-500/15 text-amber-500",
    passed: "bg-emerald-500/15 text-emerald-500",
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
    case "queued":
      return <ClockIcon className="size-4 text-slate-400 animate-pulse" />
    default:
      return <ClockIcon className="size-4 text-muted-foreground" />
  }
}

function formatDuration(ms: number | null): string {
  if (!ms || ms === 0) return "-"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatNumber(n: number | null): string {
  if (n === null || n === undefined) return "-"
  return n.toLocaleString("id-ID")
}

export default function PipelineDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pipelineId = params.id as string
  const user = getCurrentUser()
  const isViewer = user?.role === "viewer"
  const canEdit = hasMinimumRole(user?.role, "editor")
  const canDelete = hasMinimumRole(user?.role, "admin")

  const [pipeline, setPipeline] = React.useState<Pipeline | null>(null)
  const [runs, setRuns] = React.useState<PipelineRun[]>([])
  const [loading, setLoading] = React.useState(true)
  const [running, setRunning] = React.useState(false)
  const [runStatus, setRunStatus] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    fetchPipeline()
    fetchRuns()
  }, [pipelineId])

  React.useEffect(() => {
    if (isViewer) router.push("/home")
  }, [isViewer, router])

  const fetchPipeline = async () => {
    try {
      const token = getAccessToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_URL}/api/pipelines/${pipelineId}`, { headers })
      const data = await res.json()
      setPipeline(data)
    } catch {
      router.push("/pipeline")
    } finally {
      setLoading(false)
    }
  }

  const fetchRuns = async () => {
    try {
      const token = getAccessToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_URL}/api/pipelines/${pipelineId}/runs?limit=10`, { headers })
      const data = await res.json()
      setRuns(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Gagal memuat riwayat run")
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
      toast.error("Gagal menjalankan pipeline")
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
          fetchRuns()
        }
      } catch {
        toast.error("Gagal memeriksa status pipeline")
        clearInterval(interval)
        setRunning(false)
      }
    }, 3000)
  }

  const handleDelete = async () => {
    setDeleteOpen(false)
    setDeleting(true)
    try {
      const token = getAccessToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      await fetch(`${API_URL}/api/pipelines/${pipelineId}`, { method: "DELETE", headers })
      router.push("/pipeline")
    } catch {
      toast.error("Gagal menghapus pipeline")
      setDeleting(false)
    }
  }

  if (isViewer) return null

  if (loading) {
    return <PipelineDetailSkeleton />
  }

  if (!pipeline) return null

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push("/pipeline")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{pipeline.name}</h1>
            <StatusBadge status={pipeline.status} />
          </div>
          {pipeline.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{pipeline.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/pipeline/builder?id=${pipelineId}`)}>
              <Pencil1Icon className="size-3.5 mr-1" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" size="sm" className="text-red-400 hover:text-red-400" onClick={() => setDeleteOpen(true)} disabled={deleting}>
              <TrashIcon className="size-3.5 mr-1" />
              Hapus
            </Button>
          )}
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

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Run History</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">{runs.length} run</span>
          </div>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat run.</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.id} className="border border-border/60 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={run.status} />
                      <StatusBadge status={run.status} />
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(run.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {run.run_id && (
                      <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">{run.run_id}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Duration</p>
                      <p className="mt-0.5 font-mono text-foreground">{formatDuration(run.duration_ms)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Rows Read</p>
                      <p className="mt-0.5 font-mono text-foreground">{formatNumber(run.rows_read)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Rows Written</p>
                      <p className="mt-0.5 font-mono text-foreground">{formatNumber(run.rows_written)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Quality</p>
                      <div className="mt-0.5">{run.quality_status ? <StatusBadge status={run.quality_status} /> : <span className="text-xs text-muted-foreground">-</span>}</div>
                    </div>
                  </div>

                  {run.tasks_total && run.tasks_total > 0 && (
                    <div className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">Tasks</span>
                        <span className="font-mono">{run.tasks_completed || 0}/{run.tasks_total}</span>
                      </div>
                      <Progress value={((run.tasks_completed || 0) / run.tasks_total) * 100} className="h-1.5" />
                    </div>
                  )}

                  {run.error_message && (
                    <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-red-400 mb-1">Error</p>
                      <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap max-h-32 overflow-y-auto">{run.error_message}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {canEdit && (
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
      )}
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
