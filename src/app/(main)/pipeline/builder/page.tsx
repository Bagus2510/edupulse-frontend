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
import { motion } from "motion/react"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function PipelineBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
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
      setTables(data)
    } catch {
      // ignore
    }
  }

  const fetchPipeline = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/pipelines/${id}`)
      const data = await res.json()
      setName(data.name)
      setDescription(data.description || "")
      setSteps(
        data.steps.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          name: s.name as string,
          source_table: (s.source_table as string) || "",
          query: s.query as string,
          query_type: s.query_type as "sql" | "python",
          dest_table: (s.dest_table as string) || "",
        }))
      )
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        steps: steps.map((s, i) => ({
          name: s.name,
          source_table: s.source_table,
          query: s.query,
          query_type: s.query_type,
          dest_table: s.dest_table,
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
