"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { StepEditor, PipelineStep } from "@/components/pipeline/step-editor"
import { RocketIcon, ArrowLeftIcon, ReloadIcon, FileTextIcon } from "@radix-ui/react-icons"
import { FieldGuide } from "@/components/pipeline/field-guide"
import { motion, type Variants } from "motion/react"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SCHEDULE_OPTIONS = [
  { value: "manual", label: "Manual", cron: "" },
  { value: "@hourly", label: "@hourly", cron: "@hourly" },
  { value: "@daily", label: "@daily (setiap jam 00:00)", cron: "@daily" },
  { value: "@weekly", label: "@weekly (setiap Minggu)", cron: "@weekly" },
  { value: "@monthly", label: "@monthly (tanggal 1)", cron: "@monthly" },
  { value: "custom", label: "Custom Cron", cron: "" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

export default function PipelineBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [maxActiveRuns, setMaxActiveRuns] = React.useState(1)
  const [onFailureCallback, setOnFailureCallback] = React.useState("")
  const [scheduleOption, setScheduleOption] = React.useState("manual")
  const [customCron, setCustomCron] = React.useState("")
  const [steps, setSteps] = React.useState<PipelineStep[]>([])
  const [tables, setTables] = React.useState<{ full_name: string }[]>([])
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(!!editId)

  React.useEffect(() => {
    fetchTables()
    if (editId) fetchPipeline(parseInt(editId))
  }, [editId])

  const fetchTables = async () => {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/pipelines/tables`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setTables(Array.isArray(data) ? data : [])
    } catch {
      setTables([])
    }
  }

  const fetchPipeline = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/pipelines/${id}`)
      const data = await res.json()
      setName(data.name)
      setDescription(data.description || "")
      setMaxActiveRuns(data.max_active_runs || 1)
      setOnFailureCallback(data.on_failure_callback || "")

      // Restore schedule option
      const interval = data.schedule_interval || ""
      if (!interval) {
        setScheduleOption("manual")
      } else if (SCHEDULE_OPTIONS.some((o) => o.value === interval)) {
        setScheduleOption(interval)
      } else {
        setScheduleOption("custom")
        setCustomCron(interval)
      }

      setSteps(
        data.steps.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          name: s.name as string,
          source_table: (s.source_table as string) || "",
          query: s.query as string,
          query_type: s.query_type as "sql" | "python",
          dest_table: (s.dest_table as string) || "",
          execution_timeout: (s.execution_timeout as number) || 300,
          retries: (s.retries as number) || 1,
          retry_delay: (s.retry_delay as number) || 5,
        }))
      )
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getScheduleInterval = (): string => {
    if (scheduleOption === "custom") return customCron.trim()
    const opt = SCHEDULE_OPTIONS.find((o) => o.value === scheduleOption)
    return opt?.cron || ""
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        max_active_runs: maxActiveRuns,
        on_failure_callback: onFailureCallback.trim(),
        schedule_interval: getScheduleInterval(),
        steps: steps.map((s, i) => ({
          name: s.name,
          source_table: s.source_table,
          query: s.query,
          query_type: s.query_type,
          dest_table: s.dest_table,
          execution_timeout: s.execution_timeout,
          retries: s.retries,
          retry_delay: s.retry_delay,
        })),
      }

      const url = editId ? `${API_URL}/api/pipelines/${editId}` : `${API_URL}/api/pipelines`
      const method = editId ? "PUT" : "POST"
      const token = getAccessToken()

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/pipeline/${data.id}`)
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-8 border-2 border-pulse/20 border-t-pulse rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push("/pipeline")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {editId ? "Edit Pipeline" : "Buat Pipeline Baru"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Definisikan langkah-langkah transformasi data
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Informasi Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Pipeline</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: OULAD Basic ETL"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Deskripsi (opsional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat pipeline ini"
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Max Active Runs</Label>
                  <FieldGuide
                    title="Max Active Runs"
                    description="Jumlah maksimum instance pipeline yang bisa berjalan bersamaan. Mengatur berapa banyak run dari pipeline ini yang boleh aktif di waktu yang sama."
                    tips={[
                      "Default: 1 (run satu per satu)",
                      "Naikkan jika pipeline harus dijalankan berulang kali",
                      "Set ke 1 untuk mencegah duplikasi data",
                      " Berguna untuk scheduled pipeline yang harus menunggu run sebelumnya selesai",
                    ]}
                  />
                </div>
                <Input
                  type="number"
                  value={maxActiveRuns}
                  onChange={(e) => setMaxActiveRuns(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">On Failure Callback (opsional)</Label>
                  <FieldGuide
                    title="On Failure Callback"
                    description="URL endpoint yang akan dipanggil oleh Airflow ketika pipeline gagal. Berguna untuk mengirim notifikasi ke Slack, email, atau sistem monitoring."
                    tips={[
                      "Format: https://your-webhook.com/notify",
                      "Airflow akan POST info error ke URL ini",
                      "Contoh: Slack Incoming Webhook URL",
                      "Kosongkan jika tidak butuh notifikasi",
                    ]}
                  />
                </div>
                <Input
                  value={onFailureCallback}
                  onChange={(e) => setOnFailureCallback(e.target.value)}
                  placeholder="https://webhook.example.com/notify"
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs">Schedule Interval</Label>
                <FieldGuide
                  title="Schedule Interval"
                  description="Menentukan kapan pipeline akan dijalankan secara otomatis oleh Airflow. Pilih 'Manual' jika pipeline hanya dijalankan saat user menekan tombol Run."
                  tips={[
                    "Manual: tidak ada scheduler, trigger dari UI saja",
                    "@hourly: setiap jam menit 0",
                    "@daily: setiap hari jam 00:00 UTC",
                    "@weekly: setiap Minggu jam 00:00 UTC",
                    "@monthly: setiap tanggal 1 jam 00:00 UTC",
                    "Custom: masukkan cron expression (misal: 0 6 * * 1-5)",
                  ]}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={scheduleOption}
                  onValueChange={(val) => { if (val) setScheduleOption(val) }}
                >
                  <SelectTrigger className="h-9 w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {scheduleOption === "custom" && (
                  <Input
                    value={customCron}
                    onChange={(e) => setCustomCron(e.target.value)}
                    placeholder="0 6 * * 1-5"
                    className="h-9 flex-1 font-mono text-xs"
                  />
                )}
              </div>
              {scheduleOption === "custom" && customCron && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  Schedule: {customCron}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Langkah Transformasi</CardTitle>
              <span className="text-xs text-muted-foreground font-mono">{steps.length} step</span>
            </div>
          </CardHeader>
          <CardContent>
            <StepEditor steps={steps} onChange={setSteps} tables={tables} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/pipeline")}
        >
          Batal
        </Button>
        <Button
          className="bg-pulse hover:bg-pulse/90 text-background flex-1 sm:flex-none"
          onClick={handleSave}
          disabled={saving || !name.trim() || steps.length === 0}
        >
          {saving ? (
            <ReloadIcon className="size-3.5 mr-1.5 animate-spin" />
          ) : (
            <FileTextIcon className="size-3.5 mr-1.5" />
          )}
          Simpan Pipeline
        </Button>
      </motion.div>
    </motion.div>
  )
}
