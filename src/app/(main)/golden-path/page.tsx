"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"
import {
  CheckCircledIcon,
  CodeIcon,
  FileTextIcon,
  LightningBoltIcon,
  LoopIcon,
  ReloadIcon,
  RocketIcon,
  TableIcon,
} from "@radix-ui/react-icons"
import { InlineSelect } from "@/components/ui/inline-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { GoldenPathSkeleton } from "@/components/skeletons/golden-path-skeleton"

import { API_URL } from "@/lib/constants"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"

const SOURCE_PROFILES: Record<string, { label: string; query: string }> = {
  "raw.tester3": {
    label: "Integrated student data",
    query: "CREATE TABLE mart.golden_path_summary AS SELECT angkatan, COUNT(*) AS total_students, AVG(ipk) AS average_ipk FROM raw.tester3 GROUP BY angkatan ORDER BY angkatan",
  },
  "raw.golden_path_source": {
    label: "Golden Path sample CSV",
    query: "CREATE TABLE mart.golden_path_summary AS SELECT course, outcome, COUNT(*) AS total_students, AVG(score) AS average_score FROM raw.golden_path_source GROUP BY course, outcome",
  },
}

const phases = [
  { key: "upload", label: "Check source", icon: TableIcon },
  { key: "pipeline", label: "Run pipeline", icon: RocketIcon },
  { key: "mart", label: "Validate mart", icon: CheckCircledIcon },
  { key: "lineage", label: "Trace lineage", icon: LoopIcon },
] as const

type PhaseKey = (typeof phases)[number]["key"]
type PhaseState = "idle" | "running" | "success" | "failed"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

function authHeaders(): Record<string, string> {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function readResponse(response: Response, action: string) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${action}: ${body.detail || response.statusText}`)
  return body
}

export default function GoldenPathPage() {
  const user = getCurrentUser()
  const canRun = hasMinimumRole(user?.role, "editor")
  const [sourceTable, setSourceTable] = React.useState("raw.tester3")
  const [availableSources, setAvailableSources] = React.useState<string[]>([])
  const [phaseState, setPhaseState] = React.useState<Record<PhaseKey, PhaseState>>({
    upload: "idle",
    pipeline: "idle",
    mart: "idle",
    lineage: "idle",
  })
  const [result, setResult] = React.useState<Record<string, unknown>>({})
  const [error, setError] = React.useState("")
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    fetch(`${API_URL}/api/pipelines/tables`, { headers: authHeaders() })
      .then((response) => response.json())
      .then((tables: { full_name?: string }[]) => {
        const sources = tables.map((table) => table.full_name || "").filter((table) => table in SOURCE_PROFILES)
        setAvailableSources(sources)
        if (!sources.includes(sourceTable) && sources.length > 0) setSourceTable(sources[0])
      })
      .catch(() => setAvailableSources([]))
  }, [sourceTable])

  const updatePhase = (key: PhaseKey, state: PhaseState) => {
    setPhaseState((current) => ({ ...current, [key]: state }))
  }

  async function runGoldenPath() {
    if (!SOURCE_PROFILES[sourceTable]) {
      setError("Pilih source table yang didukung Golden Path.")
      return
    }

    setRunning(true)
    setError("")
    setResult({})
    setPhaseState({ upload: "running", pipeline: "idle", mart: "idle", lineage: "idle" })
    let activePhase: PhaseKey = "upload"

    try {
      const datasets = await readResponse(
        await fetch(`${API_URL}/api/datasets`, { headers: authHeaders() }),
        "Source dataset gagal dibaca",
      )
      if (!datasets.some((item: { full_name?: string }) => item.full_name === sourceTable)) {
        throw new Error(`Source ${sourceTable} tidak tersedia pada metadata backend.`)
      }
      updatePhase("upload", "success")
      activePhase = "pipeline"
      const martReset = await fetch(`${API_URL}/api/datasets/mart/golden-path/reset`, {
        method: "POST",
        headers: authHeaders(),
      })
      if (!martReset.ok) {
        await readResponse(martReset, "Reset demo mart gagal")
      }
      updatePhase("pipeline", "running")

      const pipeline = await readResponse(
        await fetch(`${API_URL}/api/pipelines`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Golden Path Learning Outcomes",
            description: "Repeatable portfolio demo: raw learning outcomes to mart summary.",
            max_active_runs: 1,
            schedule_interval: "",
            steps: [{
              name: "Build outcome summary",
              source_table: sourceTable,
              query_type: "sql",
              query: SOURCE_PROFILES[sourceTable].query,
              dest_table: "mart.golden_path_summary",
              execution_timeout: 300,
              retries: 1,
              retry_delay: 1,
            }],
          }),
        }),
        "Pipeline gagal dibuat",
      )
      await readResponse(
        await fetch(`${API_URL}/api/pipelines/${pipeline.id}/run`, {
          method: "POST",
          headers: authHeaders(),
        }),
        "Pipeline gagal dijalankan",
      )

      let status: Record<string, unknown> = {}
      const deadline = Date.now() + 180_000
      while (Date.now() < deadline) {
        status = await readResponse(
          await fetch(`${API_URL}/api/pipelines/${pipeline.id}/status`, { headers: authHeaders() }),
          "Status pipeline gagal dibaca",
        )
        if (status.status === "success" || status.status === "failed") break
        await new Promise((resolve) => window.setTimeout(resolve, 3000))
      }
      if (status.status !== "success") throw new Error(`Pipeline berhenti dengan status ${String(status.status || "timeout")}`)
      updatePhase("pipeline", "success")
      activePhase = "mart"
      updatePhase("mart", "running")

      const quality = await readResponse(
        await fetch(`${API_URL}/api/datasets/mart.golden_path_summary/quality/run`, {
          method: "POST",
          headers: authHeaders(),
        }),
        "Quality mart gagal",
      )
      const summary = await readResponse(
        await fetch(`${API_URL}/api/home/summary`, { headers: authHeaders() }),
        "Control Tower gagal dibaca",
      )
      updatePhase("mart", "success")
      activePhase = "lineage"
      updatePhase("lineage", "running")

      const lineage = await readResponse(
        await fetch(`${API_URL}/api/lineage`, { headers: authHeaders() }),
        "Lineage gagal dibaca",
      )
      updatePhase("lineage", "success")
      setResult({ sourceTable, pipeline, status, quality, summary, lineage })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Golden Path gagal dijalankan."
      setError(message)
      updatePhase(activePhase, "failed")
    } finally {
      setRunning(false)
    }
  }

  return (
    <PageSkeletonWrapper skeleton={<GoldenPathSkeleton />}>
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse">
            <LightningBoltIcon className="size-3" />
            Repeatable portfolio demo
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Golden Path</h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Jalankan satu alur nyata dari raw dataset sampai metadata, mart, Control Tower, dan lineage. Tidak memakai angka mock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 rounded-md font-mono text-[10px]"><CodeIcon className="size-3" />API-backed</Badge>
          <Badge variant="outline" className="gap-1.5 rounded-md font-mono text-[10px]"><FileTextIcon className="size-3" />Resettable</Badge>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-px border border-border bg-border md:grid-cols-4">
        {phases.map((phase, index) => {
          const state = phaseState[phase.key]
          const Icon = phase.icon
          return (
            <div key={phase.key} className="relative bg-background px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                <Icon className={`size-4 ${state === "success" ? "text-emerald-400" : state === "failed" ? "text-red-400" : state === "running" ? "animate-pulse text-pulse" : "text-muted-foreground"}`} />
              </div>
              <p className="mt-6 text-sm font-semibold">{phase.label}</p>
              <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{state}</p>
            </div>
          )
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <motion.div variants={itemVariants}>
          <Card className="rounded-lg border-border shadow-none">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm">Source dataset</CardTitle>
              <p className="text-xs text-muted-foreground">Upload CSV sekali di Dataset, lalu pilih raw table di sini.</p>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-3 border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center">
                <TableIcon className="size-4 shrink-0 text-pulse" />
                <InlineSelect
                  value={sourceTable}
                  onValueChange={(value) => { if (value) setSourceTable(value) }}
                  options={availableSources.map((source) => ({ value: source, label: `${source} · ${SOURCE_PROFILES[source].label}` }))}
                  placeholder={availableSources.length ? "Pilih raw source" : "Belum ada source tersedia"}
                  className="min-w-0 flex-1"
                />
                <Badge variant="outline" className="w-fit font-mono text-[10px]">Airflow source</Badge>
              </div>
              <div className="grid gap-3 border border-border bg-muted/20 p-4 text-xs md:grid-cols-3">
                <div><p className="font-mono text-[10px] text-muted-foreground">SOURCE</p><p className="mt-1 font-medium">{sourceTable}</p></div>
                <div><p className="font-mono text-[10px] text-muted-foreground">MART</p><p className="mt-1 font-medium">mart.golden_path_summary</p></div>
                <div><p className="font-mono text-[10px] text-muted-foreground">QUALITY</p><p className="mt-1 font-medium">row count + null rate</p></div>
              </div>
              {error && <div role="alert" className="border-l-2 border-red-400 bg-red-400/5 px-4 py-3 text-xs leading-5 text-red-300">{error}</div>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => window.location.assign("/datasets")} disabled={running} className="h-10 rounded-md">Upload di Dataset</Button>
                <Button type="button" onClick={() => void runGoldenPath()} disabled={running || !availableSources.length || !canRun} className="h-10 rounded-md bg-pulse px-5 text-background hover:bg-pulse/90">
                {running ? <ReloadIcon className="mr-2 size-3.5 animate-spin" /> : <RocketIcon className="mr-2 size-3.5" />}
                  {running ? "Menjalankan golden path" : canRun ? "Jalankan golden path" : "Role editor diperlukan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-lg border-border shadow-none">
            <CardHeader className="border-b border-border"><CardTitle className="text-sm">Run contract</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6 text-xs leading-5 text-muted-foreground">
              <p><strong className="text-foreground">Satu sumber:</strong> raw.tester3 sudah tersedia dan dipakai pipeline existing.</p>
              <p><strong className="text-foreground">Satu transform:</strong> Airflow membuat mart summary.</p>
              <p><strong className="text-foreground">Satu bukti:</strong> quality, Control Tower, dan lineage dibaca dari API.</p>
              <p><strong className="text-foreground">Batas:</strong> dashboard Superset perlu dependency manual atau UUID dashboard yang sudah tersedia.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {Object.keys(result).length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-400/30 bg-emerald-400/5 rounded-lg shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircledIcon className="size-4" />Golden Path selesai</div>
              <div className="mt-4 grid gap-3 text-xs md:grid-cols-4">
                <ResultStat label="Pipeline" value={String((result.status as Record<string, unknown>)?.status || "-")} />
                <ResultStat label="Mart quality" value={String((result.quality as Record<string, unknown>)?.quality_status || "-")} />
                <ResultStat label="Lineage nodes" value={String(((result.lineage as Record<string, unknown>)?.nodes as unknown[])?.length || 0)} />
                <ResultStat label="Lineage edges" value={String(((result.lineage as Record<string, unknown>)?.edges as unknown[])?.length || 0)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </PageSkeletonWrapper>
  )
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return <div className="border border-border bg-background/60 px-3 py-2"><p className="font-mono text-[10px] uppercase text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>
}
