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
import { getAccessToken } from "@/lib/auth"

interface DatasetTable {
  schema_name: string
  table_name: string
  full_name: string
  row_count: number
  column_count: number
  last_built_at?: string | null
  freshness?: "fresh" | "stale" | "never_built" | null
  meta_row_count?: number | null
}

interface TableDetail {
  schema: string
  table: string
  row_count: number
  columns: { name: string; type: string }[]
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

export default function DatasetsPage() {
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

  const fetchDatasets = async () => {
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

  const fetchMartDatasets = async () => {
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
      setDetailInfo(data)
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
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dataset</h1>
          <p className="text-sm text-muted-foreground">
            Upload CSV/Excel ke schema raw untuk digunakan di pipeline
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Separator />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className={`border-border/60 transition-colors ${dragOver ? "border-pulse bg-pulse/5" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="size-14 rounded-2xl bg-pulse/10 flex items-center justify-center">
                  <UploadIcon className="size-6 text-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {uploading ? "Mengupload..." : "Drag & drop file atau klik untuk upload"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV, XLSX, XLS — maksimal 100 MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(ds.full_name) }}
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      </div>
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
