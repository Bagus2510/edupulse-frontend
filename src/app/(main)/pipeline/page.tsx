"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  RocketIcon,
  ReloadIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  PlusIcon,
  PlayIcon,
  Pencil1Icon,
  TrashIcon,
  EyeOpenIcon,
  StopIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { API_URL } from "@/lib/constants"
import { apiFetch } from "@/lib/api-client"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"
import { useDomain } from "@/lib/domain-context"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { PipelineSkeleton } from "@/components/skeletons/pipeline-skeleton"
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} satisfies Variants

type PipelineStatus = "draft" | "active" | "running" | "queued" | "success" | "failed"

interface Pipeline {
  id: number
  name: string
  description: string | null
  status: PipelineStatus
  last_run_at: string | null
  step_count: number
  schedule_interval: string | null
  schedule_description: string
  is_active: boolean
  domain_id: number | null
  created_at: string
  rows_read: number | null
  rows_written: number | null
  duration_ms: number | null
  quality_status: string | null
}


function StatusBadge({ status }: { status: PipelineStatus }) {
  const variants: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border/50",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    running: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    queued: "bg-slate-400/10 text-slate-400 border-slate-400/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-medium px-1.5 py-0 ${variants[status] || variants.draft}`}>
      {status}
    </Badge>
  )
}

function StatusIcon({ status }: { status: PipelineStatus }) {
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

export default function PipelinePage() {
  const router = useRouter()
  const { activeDomainId } = useDomain()
  const user = getCurrentUser()
  const isViewer = user?.role === "viewer"
  const canEdit = hasMinimumRole(user?.role, "editor")
  const canDelete = hasMinimumRole(user?.role, "admin")
  const [pipelines, setPipelines] = React.useState<Pipeline[]>([])
  const [loading, setLoading] = React.useState(true)
  const [runningId, setRunningId] = React.useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Pipeline | null>(null)
  const [interruptTarget, setInterruptTarget] = React.useState<Pipeline | null>(null)
  const [interrupting, setInterrupting] = React.useState(false)
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(() => {
    if (isViewer) router.push("/home")
  }, [isViewer, router])


  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const path = activeDomainId
          ? `/api/pipelines?domain_id=${activeDomainId}`
          : "/api/pipelines"
        const data = await apiFetch<Pipeline[]>(path)
        setPipelines(data)
        const hasRunning = data.some((pipeline) => pipeline.status === "running" || pipeline.status === "queued")
        if (!hasRunning && pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal memperbarui status pipeline")
        if (pollRef.current) clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 3000)
  }

  const fetchPipelines = React.useCallback(async () => {
    try {
      const path = activeDomainId
        ? `/api/pipelines?domain_id=${activeDomainId}`
        : "/api/pipelines"
      const data = await apiFetch<Pipeline[]>(path)
      setPipelines(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat data pipeline")
    } finally {
      setLoading(false)
    }
  }, [activeDomainId])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loader updates state only after awaited API calls.
    void fetchPipelines()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchPipelines])

  const handleRun = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setRunningId(id)
    try {
      await apiFetch(`/api/pipelines/${id}/run`, { method: "POST" })
      await fetchPipelines()
      startPolling()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menjalankan pipeline")
    } finally {
      setRunningId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const token = getAccessToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      await fetch(`${API_URL}/api/pipelines/${deleteTarget.id}`, { method: "DELETE", headers })
      setPipelines((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      toast.error("Gagal menghapus pipeline")
    } finally {
      setDeleteTarget(null)
    }
  }

  const toggleActive = async (id: number) => {
    try {
      await apiFetch(`/api/pipelines/${id}/toggle-active`, { method: "PATCH" })
      await fetchPipelines()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status pipeline")
    }
  }

  const handleInterrupt = async () => {
    if (!interruptTarget) return
    setInterrupting(true)
    try {
      await apiFetch(`/api/pipelines/${interruptTarget.id}/cancel`, { method: "POST" })
      setInterruptTarget(null)
      await fetchPipelines()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghentikan pipeline")
    } finally {
      setInterrupting(false)
    }
  }

  if (isViewer) return null

  return (
    <PageSkeletonWrapper skeleton={<PipelineSkeleton />}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-7xl mx-auto"
      >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse"><RocketIcon className="size-3" />Data operations</div>
          <h1 className="text-3xl font-semibold tracking-tight">Pipeline ETL</h1>
          <p className="text-sm text-muted-foreground">Buat, jalankan, dan pantau transformasi data.</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => router.push("/pipeline/builder")}
            className="rounded-md bg-pulse hover:bg-pulse/90 text-background"
          >
            <PlusIcon className="size-3.5 mr-1.5" />
            Buat Pipeline
          </Button>
        )}
      </motion.div>

      {/* Pipeline List */}
      <div className="space-y-2">
        {pipelines.map((pipeline) => (
          <motion.div key={pipeline.id} variants={itemVariants}>
            <Card
              className="group cursor-pointer rounded-lg border-border/60 shadow-none hover:border-pulse/40 transition-all duration-200 py-0"
              onClick={() => router.push(`/pipeline/${pipeline.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Main content */}
                  <div className="flex-1 min-w-0 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <div className="shrink-0 mt-0.5">
                        <StatusIcon status={pipeline.status} />
                      </div>

                      {/* Name + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">{pipeline.name}</h3>
                          <StatusBadge status={pipeline.status} />
                          {pipeline.schedule_description && pipeline.schedule_description !== "Manual" && (
                            <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 gap-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
                              <ClockIcon className="size-2.5" />
                              {pipeline.schedule_description}
                            </Badge>
                          )}
                          {!pipeline.is_active && (
                            <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 bg-muted text-muted-foreground border-border/50">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {pipeline.description || "Tanpa deskripsi"}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                        <div className="text-center">
                          <p className="font-mono text-foreground">{pipeline.step_count}</p>
                          <p className="text-[10px]">steps</p>
                        </div>
                        {pipeline.rows_read != null && (
                          <div className="text-center">
                            <p className="font-mono text-foreground">{pipeline.rows_read.toLocaleString()}</p>
                            <p className="text-[10px]">rows read</p>
                          </div>
                        )}
                        {pipeline.rows_written != null && (
                          <div className="text-center">
                            <p className="font-mono text-foreground">{pipeline.rows_written.toLocaleString()}</p>
                            <p className="text-[10px]">rows written</p>
                          </div>
                        )}
                        {pipeline.duration_ms != null && (
                          <div className="text-center">
                            <p className="font-mono text-foreground">{(pipeline.duration_ms / 1000).toFixed(1)}s</p>
                            <p className="text-[10px]">duration</p>
                          </div>
                        )}
                        {pipeline.quality_status && (
                          <div className="text-center">
                            <Badge variant="outline" className={`text-[10px] font-medium px-1.5 py-0 ${
                              pipeline.quality_status === "passed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : pipeline.quality_status === "failed"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : pipeline.quality_status === "warning"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-muted text-muted-foreground border-border/50"
                            }`}>
                              {pipeline.quality_status}
                            </Badge>
                          </div>
                        )}
                        <div className="text-right min-w-25">
                          <p className="font-mono text-[10px]">
                              {pipeline.last_run_at
                              ? new Date(pipeline.last_run_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                              : "-"}
                          </p>
                          <p className="text-[10px]">terakhir jalan</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/pipeline/${pipeline.id}`)}
                        >
                          <EyeOpenIcon className="size-3.5" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/pipeline/builder?id=${pipeline.id}`)}
                          >
                            <Pencil1Icon className="size-3.5" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-400"
                            onClick={() => setDeleteTarget(pipeline)}
                          >
                            <TrashIcon className="size-3.5" />
                          </Button>
                        )}
                        {canEdit && (
                          <>
                            <div className="w-px h-5 bg-border/60 mx-1" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`size-8 ${pipeline.is_active ? "text-emerald-400 hover:text-emerald-300" : "text-muted-foreground hover:text-foreground"}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleActive(pipeline.id)
                              }}
                              title={pipeline.is_active ? "Nonaktifkan jadwal" : "Aktifkan jadwal"}
                            >
                              {pipeline.is_active ? (
                                <ClockIcon className="size-3.5" />
                              ) : (
                                <PlayIcon className="size-3.5" />
                              )}
                            </Button>
                            <div className="w-px h-5 bg-border/60 mx-1" />
                            {pipeline.status === "running" || pipeline.status === "queued" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setInterruptTarget(pipeline)
                                }}
                              >
                                <StopIcon className="size-3 mr-1" />
                                Stop
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={(e) => handleRun(pipeline.id, e)}
                                disabled={runningId === pipeline.id || pipeline.step_count === 0}
                              >
                                {runningId === pipeline.id ? (
                                  <ReloadIcon className="size-3 mr-1 animate-spin" />
                                ) : (
                                  <PlayIcon className="size-3 mr-1" />
                                )}
                                Run
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {pipelines.length === 0 && !loading && (
          <motion.div variants={itemVariants}>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <RocketIcon className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Belum ada pipeline</p>
                <p className="text-xs text-muted-foreground mb-4">Buat pipeline pertama untuk memulai</p>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/pipeline/builder")}
                  >
                    <PlusIcon className="size-3.5 mr-1.5" />
                    Buat Pipeline
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 border-2 border-pulse/20 border-t-pulse rounded-full animate-spin" />
        </div>
      )}

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5 py-3">
          <CardContent className="flex items-start gap-3 py-0">
            <RocketIcon className="size-4 text-pulse mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Pipeline Builder: </span>
              Buat langkah transformasi SQL/Python, generate DAG Airflow otomatis, dan jalankan dari sini.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interrupt Confirmation */}
      <AlertDialog open={!!interruptTarget} onOpenChange={(open) => !open && setInterruptTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Interrupt Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Pipeline <span className="font-mono font-medium text-foreground">{interruptTarget?.name}</span> sedang berjalan. Yakin ingin menghentikannya? Status akan diubah ke <span className="font-medium text-foreground">failed</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={interrupting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleInterrupt}
              disabled={interrupting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {interrupting ? (
                <>
                  <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                  Menghentikan...
                </>
              ) : (
                <>
                  <StopIcon className="size-3 mr-1.5" />
                  Stop Pipeline
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Pipeline <span className="font-mono font-medium text-foreground">{deleteTarget?.name}</span> akan dihapus permanen beserta semua langkah transformasinya.
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
      </motion.div>
    </PageSkeletonWrapper>
  )
}
