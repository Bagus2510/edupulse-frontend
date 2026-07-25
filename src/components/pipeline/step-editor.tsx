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

export interface PipelineStep {
  id: string
  name: string
  source_table: string
  query: string
  query_type: "sql" | "python"
  dest_table: string
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
  const [templateOpen, setTemplateOpen] = React.useState<number | null>(null)

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
      },
    ])
  }

  const updateStep = (id: string, field: keyof PipelineStep, value: string) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeStep = (id: string) => {
    onChange(steps.filter((s) => s.id !== id))
  }

  const applyTemplate = (stepId: string, query: string) => {
    updateStep(stepId, "query", query)
    setTemplateOpen(null)
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
                <select
                  value={step.query_type}
                  onChange={(e) => updateStep(step.id, "query_type", e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-pulse/30"
                >
                  <option value="sql">SQL</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Source Table (opsional)</Label>
                <select
                  value={step.source_table}
                  onChange={(e) => updateStep(step.id, "source_table", e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-pulse/30"
                >
                  <option value="">Pilih source...</option>
                  {tables.map((t) => (
                    <option key={t.full_name} value={t.full_name}>{t.full_name}</option>
                  ))}
                </select>
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
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setTemplateOpen(templateOpen === index ? null : index)}
                  >
                    <PlusIcon className="size-3 mr-1" />
                    Template
                  </Button>
                  {templateOpen === index && (
                    <div className="absolute right-0 top-8 z-50 w-64 bg-popover border border-border rounded-lg shadow-lg p-1.5">
                      {SQL_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          className="w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                          onClick={() => applyTemplate(step.id, tpl.query)}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
