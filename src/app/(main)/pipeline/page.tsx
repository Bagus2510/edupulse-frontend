"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  RocketIcon,
  ReloadIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  PlusIcon,
  PlayIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"

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

type PipelineStatus = "draft" | "active" | "running" | "success" | "failed"

interface Pipeline {
  id: number
  name: string
  description: string | null
  status: PipelineStatus
  last_run_at: string | null
  step_count: number
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

function StatusBadge({ status }: { status: PipelineStatus }) {
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

export default function PipelinePage() {
  const router = useRouter()
  const [pipelines, setPipelines] = React.useState<Pipeline[]>([])
  const [loading, setLoading] = React.useState(true)
  const [runningId, setRunningId] = React.useState<number | null>(null)
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(() => {
    fetchPipelines()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      await fetchPipelines()
      const res = await fetch(`${API_URL}/api/pipelines`)
      const data = await res.json()
      const hasRunning = data.some((p: Pipeline) => p.status === "running")
      if (!hasRunning && pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 3000)
  }

  const fetchPipelines = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pipelines`)
      const data = await res.json()
      setPipelines(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async (id: number) => {
    setRunningId(id)
    try {
      const token = getAccessToken()
      await fetch(`${API_URL}/api/pipelines/${id}/run`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      fetchPipelines()
      startPolling()
    } catch {
      // ignore
    } finally {
      setRunningId(null)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pipeline ETL</h1>
          <p className="text-sm text-muted-foreground">
            Buat, jalankan, dan pantau pipeline transformasi data
          </p>
        </div>
        <Button
          onClick={() => router.push("/pipeline/builder")}
          className="bg-pulse hover:bg-pulse/90 text-background"
        >
          <PlusIcon className="size-3.5 mr-1.5" />
          Buat Pipeline
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Pipeline Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <Card
            key={pipeline.id}
            className="group cursor-pointer hover:border-pulse/30 transition-colors"
            onClick={() => router.push(`/pipeline/${pipeline.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-sm font-semibold truncate">{pipeline.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {pipeline.description || "Tanpa deskripsi"}
                  </CardDescription>
                </div>
                <StatusIcon status={pipeline.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Langkah</p>
                  <p className="font-mono">{pipeline.step_count} step</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Status</p>
                  <StatusBadge status={pipeline.status} />
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-0.5">Terakhir dijalankan</p>
                  <p className="font-mono text-[10px]">
                    {pipeline.last_run_at
                      ? new Date(pipeline.last_run_at).toLocaleString("id-ID")
                      : "Belum pernah"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRun(pipeline.id)}
                  disabled={runningId === pipeline.id || pipeline.step_count === 0}
                >
                  {runningId === pipeline.id ? (
                    <ReloadIcon className="size-3 mr-1 animate-spin" />
                  ) : (
                    <PlayIcon className="size-3 mr-1" />
                  )}
                  Jalankan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {pipelines.length === 0 && !loading && (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <RocketIcon className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Belum ada pipeline</p>
                <p className="text-xs text-muted-foreground mb-4">Buat pipeline pertama untuk memulai</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/pipeline/builder")}
                >
                  <PlusIcon className="size-3.5 mr-1.5" />
                  Buat Pipeline
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 border-2 border-pulse/20 border-t-pulse rounded-full animate-spin" />
        </div>
      )}

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5">
          <CardContent className="flex items-start gap-3 py-4">
            <RocketIcon className="size-4 text-pulse mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Pipeline Builder: </span>
              Buat langkah transformasi SQL/Python, generate DAG Airflow otomatis, dan jalankan dari sini.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
