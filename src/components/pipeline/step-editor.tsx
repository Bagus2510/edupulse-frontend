"use client"

import * as React from "react"
import Editor from "react-simple-code-editor"
import Prism from "prismjs"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-python"
import "prismjs/themes/prism-tomorrow.css"
import { TrashIcon, PlusIcon, DragHandleHorizontalIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InlineSelect } from "@/components/ui/inline-select"
import { FieldGuide } from "./field-guide"

export interface PipelineStep {
  id: string
  name: string
  source_table: string
  query: string
  query_type: "sql" | "python"
  dest_table: string
  execution_timeout: number
  retries: number
  retry_delay: number
}

interface StepEditorProps {
  steps: PipelineStep[]
  onChange: (steps: PipelineStep[]) => void
  tables: { full_name: string }[]
}

const SQL_TEMPLATES = [
  { label: "SELECT * (filter)", query: "SELECT *\nFROM raw.table_name\nWHERE column_name IS NOT NULL" },
  { label: "JOIN two tables", query: "SELECT a.*, b.column_name\nFROM raw.table_a a\nJOIN raw.table_b b ON a.id = b.table_a_id" },
  { label: "AGGREGATE by group", query: "SELECT group_column, COUNT(*) as total, AVG(value_column) as avg_value\nFROM raw.table_name\nGROUP BY group_column" },
  { label: "CREATE TABLE AS", query: "CREATE TABLE mart.new_table AS\nSELECT *\nFROM raw.source_table\nWHERE condition" },
  { label: "INSERT INTO", query: "INSERT INTO mart.target_table (col1, col2)\nSELECT col1, col2\nFROM raw.source_table" },
  { label: "UPDATE with JOIN", query: "UPDATE mart.target_table t\nSET column_name = s.new_value\nFROM raw.source_table s\nWHERE t.id = s.target_id" },
]

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

export function StepEditor({ steps, onChange, tables }: StepEditorProps) {
  const addStep = () => {
    onChange([
      ...steps,
      {
        id: genId(),
        name: `Step ${steps.length + 1}`,
        source_table: "",
        query: "",
        query_type: "sql",
        dest_table: "",
        execution_timeout: 300,
        retries: 1,
        retry_delay: 5,
      },
    ])
  }

  const updateStep = (id: string, field: keyof PipelineStep, value: string | number) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeStep = (id: string) => {
    onChange(steps.filter((s) => s.id !== id))
  }

  const applyTemplate = (stepId: string, query: string) => {
    updateStep(stepId, "query", query)
  }

  const highlight = (code: string, lang: string) => {
    const grammar = lang === "python" ? Prism.languages.python : Prism.languages.sql
    return Prism.highlight(code, grammar, lang)
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={step.id} className="border-border/60">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DragHandleHorizontalIcon className="size-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">Step {index + 1}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-red-400"
                onClick={() => removeStep(step.id)}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Step</Label>
                <Input
                  value={step.name}
                  onChange={(e) => updateStep(step.id, "name", e.target.value)}
                  placeholder="Contoh: Filter assessments"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipe Query</Label>
                <InlineSelect
                  value={step.query_type}
                  onValueChange={(v) => { if (v) updateStep(step.id, "query_type", v) }}
                  options={[
                    { value: "sql", label: "SQL" },
                    { value: "python", label: "Python" },
                  ]}
                  placeholder="Pilih tipe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Source Table (raw only, opsional)</Label>
                <InlineSelect
                  value={step.source_table || "__none__"}
                  onValueChange={(v) => updateStep(step.id, "source_table", v === "__none__" || !v ? "" : v)}
                  options={[
                    { value: "__none__", label: "Tidak pakai source table" },
                    ...tables.map((t) => ({ value: t.full_name, label: t.full_name })),
                  ]}
                  placeholder="Pilih source table"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Destination Table (opsional)</Label>
                <Input
                  value={step.dest_table}
                  onChange={(e) => updateStep(step.id, "dest_table", e.target.value)}
                  placeholder="mart.nama_tabel"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Query</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                      />
                    }
                  >
                    <PlusIcon className="size-3 mr-1" />
                    Template
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={4} className="w-64 p-1.5">
                    {SQL_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        className="w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                        onClick={() => applyTemplate(step.id, tpl.query)}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <Editor
                  value={step.query}
                  onValueChange={(code) => updateStep(step.id, "query", code)}
                  highlight={(code) => highlight(code, step.query_type === "python" ? "python" : "sql")}
                  padding={12}
                  placeholder={step.query_type === "python" ? "# Python code here\n" : "-- SQL query here\n"}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    lineHeight: 1.6,
                    backgroundColor: "hsl(var(--background))",
                    minHeight: 80,
                  }}
                  textareaClassName="!outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Timeout (detik)</Label>
                  <FieldGuide
                    title="Execution Timeout"
                    description="Batas waktu maksimum eksekusi step ini. Jika melebihi batas, step akan dianggap gagal dan dihentikan oleh Airflow."
                    tips={[
                      "Default: 300 detik (5 menit)",
                      "SQL Query biasanya cukup 60-120 detik",
                      "Python Transform bisa butuh lebih lama tergantung ukuran data",
                      "Set ke 0 untuk tanpa batas (tidak disarankan)",
                    ]}
                  />
                </div>
                <Input
                  type="number"
                  value={step.execution_timeout}
                  onChange={(e) => updateStep(step.id, "execution_timeout", parseInt(e.target.value) || 300)}
                  min={1}
                  max={3600}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Retries</Label>
                  <FieldGuide
                    title="Retry Count"
                    description="Jumlah kali Airflow akan mencoba menjalankan ulang step ini jika gagal sebelum dianggap gagal total."
                    tips={[
                      "Default: 1 retry",
                      "Network timeout biasanya butuh 1-2 retry",
                      "Jangan set terlalu tinggi untuk menghindari infinite loops",
                      "Step gagal akan retry dengan delay di antara percobaan",
                    ]}
                  />
                </div>
                <Input
                  type="number"
                  value={step.retries}
                  onChange={(e) => updateStep(step.id, "retries", parseInt(e.target.value) || 0)}
                  min={0}
                  max={10}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Retry Delay (mnt)</Label>
                  <FieldGuide
                    title="Retry Delay"
                    description="Waktu tunggu (dalam menit) antara setiap percobaan retry. Memberi waktu untuk sistem pulih dari error sementara."
                    tips={[
                      "Default: 5 menit",
                      "Untuk network issues, 2-5 menit sudah cukup",
                      "Untuk resource contention, bisa set 10-15 menit",
                      "Terlalu pendek = retry sebelum sistem pulih",
                    ]}
                  />
                </div>
                <Input
                  type="number"
                  value={step.retry_delay}
                  onChange={(e) => updateStep(step.id, "retry_delay", parseInt(e.target.value) || 1)}
                  min={1}
                  max={60}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addStep}
      >
        <PlusIcon className="size-3.5 mr-1.5" />
        Tambah Step
      </Button>
    </div>
  )
}
