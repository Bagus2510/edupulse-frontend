"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { DatasetsSkeleton } from "@/components/skeletons/datasets-skeleton"
import {
  UploadIcon,
  TrashIcon,
  ReloadIcon,
  TableIcon,
  FileIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ColumnsIcon,
  RowsIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import { toast } from "sonner"
import { API_URL } from "@/lib/constants"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"

interface DatasetTable {
  schema_name: string
  table_name: string
  full_name: string
  row_count: number
  column_count: number
  last_built_at?: string | null
  freshness?: "fresh" | "stale" | "never_built" | null
  meta_row_count?: number | null
  quality_status?: "unknown" | "passed" | "warning" | "failed"
  quality_score?: number | null
  freshness_status?: string | null
  last_loaded_at?: string | null
}

interface TableDetail {
  schema: string
  table: string
  row_count: number
  columns: { name: string; type: string }[]
  quality?: {
    asset: { quality_status: string; quality_score: number | null; freshness_status: string }
    checks: { check_name: string; status: string; severity: string; message: string }[]
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function DatasetQualityBadge({ dataset }: { dataset: DatasetTable }) {
  const status = dataset.quality_status ?? "unknown"
  const tone = status === "passed"
    ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
    : status === "warning"
      ? "text-amber-500 border-amber-500/30 bg-amber-500/5"
      : status === "failed"
        ? "text-red-500 border-red-500/30 bg-red-500/5"
        : "text-muted-foreground border-border"
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 border ${tone}`}>
        {status === "unknown" ? "Quality belum dicek" : `Quality ${status}`}
      </span>
      {dataset.quality_score !== null && dataset.quality_score !== undefined && (
        <span className="text-[10px] font-mono text-muted-foreground">{dataset.quality_score.toFixed(0)}/100</span>
      )}
    </div>
  )
}

export default function DatasetsPage() {
  const user = getCurrentUser()
  const canUpload = hasMinimumRole(user?.role, "editor")
  const canDelete = hasMinimumRole(user?.role, "admin")
  const [datasets, setDatasets] = React.useState<DatasetTable[]>([])
  const [martDatasets, setMartDatasets] = React.useState<DatasetTable[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [uploadResult, setUploadResult] = React.useState<{ message: string; table: string; rows: number; columns: number } | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [detailTable, setDetailTable] = React.useState<DatasetTable | null>(null)
  const [detailInfo, setDetailInfo] = React.useState<TableDetail | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetchDatasets()
    fetchMartDatasets()
  }, [])

  async function fetchDatasets() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/datasets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setDatasets(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function fetchMartDatasets() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/datasets/mart`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setMartDatasets(data)
    } catch {
      // ignore
    }
  }

  const fetchDetail = async (ds: DatasetTable) => {
    setDetailTable(ds)
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailInfo(null)
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/datasets/${ds.full_name}/info`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      const qualityRes = await fetch(`${API_URL}/api/datasets/${ds.full_name}/quality`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const quality = qualityRes.ok ? await qualityRes.json() : null
      setDetailInfo({ ...data, quality })
    } catch {
      // ignore
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 100 MB.")
      return
    }

    setUploading(true)
    setUploadResult(null)
    try {
      const token = getAccessToken()
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${API_URL}/api/datasets/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setUploadResult(data)
        fetchDatasets()
      } else {
        const err = await res.json()
        toast.error(err.detail || "Gagal upload")
      }
    } catch {
      toast.error("Gagal upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const token = getAccessToken()
      await fetch(`${API_URL}/api/datasets/${deleteTarget}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      toast.success(`Tabel ${deleteTarget} dihapus`)
      fetchDatasets()
    } catch {
      toast.error("Gagal menghapus tabel")
    } finally {
      setDeleteTarget(null)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <PageSkeletonWrapper skeleton={<DatasetsSkeleton />}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="space-y-2 border-b border-border pb-5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse"><TableIcon className="size-3" />Data catalog</div>
          <h1 className="text-3xl font-semibold tracking-tight">Dataset</h1>
          <p className="text-sm text-muted-foreground">Kelola raw input, mart output, metadata, freshness, dan quality.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className={`rounded-lg border-border/60 shadow-none transition-colors ${dragOver ? "border-pulse bg-pulse/5" : ""}`}
            onDragOver={(e) => { if (canUpload) { e.preventDefault(); setDragOver(true) } }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { if (canUpload) onDrop(e) }}
          >
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="size-14 rounded-2xl bg-pulse/10 flex items-center justify-center">
                  <UploadIcon className="size-6 text-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {!canUpload ? "Role editor diperlukan untuk upload" : uploading ? "Mengupload..." : "Drag & drop file atau klik untuk upload"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV, XLSX, XLS. Maksimal 100 MB.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { if (canUpload) fileInputRef.current?.click() }}
                  disabled={uploading || !canUpload}
                >
                  {uploading ? (
                    <ReloadIcon className="size-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <FileIcon className="size-3.5 mr-1.5" />
                  )}
                  Pilih File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <CheckCircledIcon className="size-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{uploadResult.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadResult.rows} baris, {uploadResult.columns} kolom
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tabel di Schema Raw</CardTitle>
                <span className="text-xs text-muted-foreground font-mono">{datasets.length} tabel</span>
              </div>
            </CardHeader>
            <CardContent>
              {datasets.length === 0 ? (
                <div className="text-center py-8">
                  <TableIcon className="size-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada dataset. Upload file di atas untuk memulai.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {datasets.map((ds) => (
                    <motion.div
                      key={ds.full_name}
                      variants={itemVariants}
                      className="border border-border/60 rounded-lg p-4 group hover:border-pulse/30 transition-all cursor-pointer"
                      onClick={() => fetchDetail(ds)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-9 rounded-lg bg-pulse/10 flex items-center justify-center shrink-0">
                            <TableIcon className="size-4 text-pulse" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{ds.table_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{ds.full_name}</p>
                          </div>
                        </div>
                        {canDelete && <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => { e.stopPropagation(); if (canDelete) setDeleteTarget(ds.full_name) }}
                          disabled={!canDelete}
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>}
                      </div>
                      <DatasetQualityBadge dataset={ds} />
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <RowsIcon className="size-3" />
                          <span>{formatNumber(ds.row_count)} baris</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ColumnsIcon className="size-3" />
                          <span>{ds.column_count} kolom</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Tabel di Schema Mart</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-violet-500/10 text-violet-400 border-violet-500/20">
                    read-only
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{martDatasets.length} tabel</span>
              </div>
            </CardHeader>
            <CardContent>
              {martDatasets.length === 0 ? (
                <div className="text-center py-8">
                  <TableIcon className="size-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada data mart. Jalankan pipeline untuk menghasilkan tabel mart.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {martDatasets.map((ds) => (
                    <motion.div
                      key={ds.full_name}
                      variants={itemVariants}
                      className="border border-border/60 rounded-lg p-4 group hover:border-violet-500/30 transition-all cursor-pointer"
                      onClick={() => fetchDetail(ds)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                            <TableIcon className="size-4 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{ds.table_name}</p>
                              {ds.freshness && (
                                <span
                                  className={`size-2 rounded-full shrink-0 ${
                                    ds.freshness === "fresh"
                                      ? "bg-emerald-500"
                                      : ds.freshness === "stale"
                                      ? "bg-amber-500"
                                      : "bg-muted-foreground/40"
                                  }`}
                                  title={
                                    ds.freshness === "fresh"
                                      ? "Fresh (< 24 jam)"
                                      : ds.freshness === "stale"
                                      ? "Stale (24 jam - 7 hari)"
                                      : "Belum pernah dibangun"
                                  }
                                />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{ds.full_name}</p>
                          </div>
                        </div>
                      </div>
                      <DatasetQualityBadge dataset={ds} />
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <RowsIcon className="size-3" />
                          <span>{formatNumber(ds.row_count)} baris</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ColumnsIcon className="size-3" />
                          <span>{ds.column_count} kolom</span>
                        </div>
                        {ds.last_built_at && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(ds.last_built_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TableIcon className="size-4 text-pulse" />
              {detailTable?.table_name}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {detailTable?.full_name}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-2 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : detailInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <RowsIcon className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">{formatNumber(detailInfo.row_count)}</span>
                  <span className="text-muted-foreground">baris</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ColumnsIcon className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">{detailInfo.columns.length}</span>
                  <span className="text-muted-foreground">kolom</span>
                </div>
              </div>

              {detailInfo.quality && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold">Data quality</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">Status metadata dan quality gate terakhir</p>
                    </div>
                    <Badge variant={detailInfo.quality.asset.quality_status === "passed" ? "success" : detailInfo.quality.asset.quality_status === "failed" ? "destructive" : "warning"}>
                      {detailInfo.quality.asset.quality_status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-muted-foreground">Score</span><p className="font-mono font-semibold">{detailInfo.quality.asset.quality_score ?? "-"}</p></div>
                    <div><span className="text-muted-foreground">Freshness</span><p className="font-medium">{detailInfo.quality.asset.freshness_status}</p></div>
                  </div>
                  {detailInfo.quality.checks.slice(0, 4).map((check) => (
                    <div key={check.check_name} className="mt-2 flex items-start gap-2 text-[10px]">
                      <span className={check.status === "passed" ? "text-emerald-500" : check.status === "warning" ? "text-amber-500" : "text-red-400"}>●</span>
                      <span className="text-muted-foreground">{check.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kolom</p>
                <ScrollArea className="h-64 border rounded-lg">
                  <div className="divide-y">
                    {detailInfo.columns.map((col) => (
                      <div key={col.name} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="font-mono text-xs">{col.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {col.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Gagal memuat info tabel.</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tabel</AlertDialogTitle>
            <AlertDialogDescription>
              Tabel <span className="font-mono font-medium text-foreground">{deleteTarget}</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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
    </PageSkeletonWrapper>
  )
}
