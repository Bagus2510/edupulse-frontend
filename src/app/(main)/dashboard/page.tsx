"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"
import {
  BarChartIcon,
  ReloadIcon,
  ExternalLinkIcon,
  LightningBoltIcon,
  PersonIcon,
  PlusIcon,
  TrashIcon,
  Pencil1Icon,
  EyeOpenIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import * as React from "react"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import { API_URL } from "@/lib/constants"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

interface DashboardItem {
  id: number
  title: string
  description: string | null
  superset_uuid: string | null
  status: string
  is_default: boolean
  created_at: string
  updated_at: string
}

function MiniBarChart() {
  const bars = [40, 65, 45, 80, 55, 70, 35, 90, 60, 75, 50, 85]
  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-pulse/20 rounded-t-sm hover:bg-pulse/40 transition-colors"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

function MiniLineChart() {
  return (
    <svg className="w-full h-16" viewBox="0 0 200 60" fill="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--pulse)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--pulse)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 45 L20 38 L40 42 L60 30 L80 35 L100 22 L120 28 L140 18 L160 25 L180 15 L200 20"
        stroke="var(--pulse)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0 45 L20 38 L40 42 L60 30 L80 35 L100 22 L120 28 L140 18 L160 25 L180 15 L200 20 L200 60 L0 60 Z"
        fill="url(#lineGrad)"
      />
    </svg>
  )
}

function MiniDonut() {
  return (
    <svg className="size-16" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r="15.9"
        fill="none"
        stroke="var(--pulse)"
        strokeWidth="3"
        strokeDasharray="68 32"
        strokeDashoffset="25"
        className="transition-all duration-1000"
      />
      <text x="18" y="19" textAnchor="middle" className="fill-foreground text-[6px] font-bold font-mono">
        68%
      </text>
    </svg>
  )
}

function EmbeddedDashboard({ dashboardUuid, title }: { dashboardUuid: string; title: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!containerRef.current || !dashboardUuid) return

    let cancelled = false
    let embedded: Awaited<ReturnType<typeof embedDashboard>> | null = null

    const embed = async () => {
      setLoading(true)
      setError(null)
      try {
        embedded = await embedDashboard({
          id: dashboardUuid,
          supersetDomain: "http://localhost:8088",
          mountPoint: containerRef.current!,
          fetchGuestToken: async () => {
            const res = await fetch(`${API_URL}/api/superset/guest-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dashboard_uuid: dashboardUuid }),
            })
            if (!res.ok) throw new Error("Gagal mengambil guest token")
            const data = await res.json()
            return data.guest_token
          },
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: true,
          },
        })
        if (!cancelled) setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat dashboard")
          setLoading(false)
        }
      }
    }

    embed()
    return () => {
      cancelled = true
      embedded?.unmount()
    }
  }, [dashboardUuid])

  return (
    <div className="relative w-full">
      {loading && (
        <div className="w-full">
          <div className="border border-border/40 rounded-lg bg-card">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-2.5 w-40 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="min-h-[500px] flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-2xl bg-muted animate-pulse" />
                <div className="space-y-2 text-center">
                  <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto" />
                  <div className="h-3 w-64 bg-muted rounded animate-pulse mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-muted animate-pulse" />
                  <div className="h-2.5 w-36 bg-muted rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/30 text-center space-y-2">
                      <div className="h-16 w-full bg-muted rounded animate-pulse" />
                      <div className="h-2 w-20 bg-muted rounded animate-pulse mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card min-h-[500px]">
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <CrossCircledIcon className="size-5 text-destructive" />
            </div>
            <p className="text-sm font-medium">Gagal memuat dashboard</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full [&_iframe]:w-full [&_iframe]:min-h-[600px] [&_iframe]:border-0"
      />
    </div>
  )
}

export default function DashboardPage() {
  const [dashboards, setDashboards] = React.useState<DashboardItem[]>([])
  const [selectedDashboard, setSelectedDashboard] = React.useState<DashboardItem | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [detailDashboard, setDetailDashboard] = React.useState<DashboardItem | null>(null)
  const [newTitle, setNewTitle] = React.useState("")
  const [newDescription, setNewDescription] = React.useState("")
  const [newUuid, setNewUuid] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [deleteTarget, setDeleteTarget] = React.useState<DashboardItem | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<DashboardItem | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editUuid, setEditUuid] = React.useState("")
  const [editStatus, setEditStatus] = React.useState("active")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboards`)
      const data = await res.json()
      setDashboards(data)
      if (data.length > 0 && !selectedDashboard) {
        setSelectedDashboard(data[0])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (e: React.MouseEvent, dashboard: DashboardItem) => {
    e.stopPropagation()
    setDetailDashboard(dashboard)
    setDetailOpen(true)
  }

  const handleAddDashboard = async () => {
    if (!newTitle.trim() || !newDescription.trim() || !newUuid.trim()) return
    try {
      await fetch(`${API_URL}/api/dashboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          superset_uuid: newUuid.trim(),
          status: "pending",
        }),
      })
      await fetchDashboards()
      setNewTitle("")
      setNewDescription("")
      setNewUuid("")
      setDialogOpen(false)
    } catch {
      // ignore
    }
  }

  const handleDeleteDashboard = async (e: React.MouseEvent, dashboard: DashboardItem) => {
    e.stopPropagation()
    setDeleteTarget(dashboard)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`${API_URL}/api/dashboards/${deleteTarget.id}`, { method: "DELETE" })
      if (selectedDashboard?.id === deleteTarget.id) {
        setSelectedDashboard(null)
      }
      setDeleteTarget(null)
      await fetchDashboards()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const handleEditDashboard = async (e: React.MouseEvent, dashboard: DashboardItem) => {
    e.stopPropagation()
    setEditTarget(dashboard)
    setEditTitle(dashboard.title)
    setEditDescription(dashboard.description || "")
    setEditUuid(dashboard.superset_uuid || "")
    setEditStatus(dashboard.status)
  }

  const confirmEdit = async () => {
    if (!editTarget || !editTitle.trim()) return
    setSaving(true)
    try {
      await fetch(`${API_URL}/api/dashboards/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          superset_uuid: editUuid.trim(),
          status: editStatus,
        }),
      })
      setEditTarget(null)
      await fetchDashboards()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageSkeletonWrapper skeleton={<DashboardSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Analitik</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard Superset tersemat untuk visualisasi data akademik
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ExternalLinkIcon className="size-3.5 mr-1.5" />
            Buka di Superset
          </Button>
          <Button variant="outline" size="sm">
            <ReloadIcon className="size-3.5 mr-1.5" />
            Segarkan
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-pulse hover:bg-pulse/90 text-background gap-1.5">
                <PlusIcon className="size-3.5" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Dashboard Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan dashboard untuk dilihat di halaman ini. Hubungkan ke Superset embed untuk visualisasi data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="dash-title">Judul Dashboard</Label>
                  <Input
                    id="dash-title"
                    placeholder="Contoh: Dropout Prediction"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dash-desc">Deskripsi</Label>
                  <Input
                    id="dash-desc"
                    placeholder="Contoh: Prediksi risiko dropout mahasiswa"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dash-uuid">Superset Dashboard UUID</Label>
                  <Input
                    id="dash-uuid"
                    placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                    value={newUuid}
                    onChange={(e) => setNewUuid(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    UUID dashboard dari Apache Superset. Diperlukan untuk embed.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button
                  className="bg-pulse hover:bg-pulse/90 text-background"
                  onClick={handleAddDashboard}
                  disabled={!newTitle.trim() || !newDescription.trim() || !newUuid.trim()}
                >
                  Tambah
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Dashboard Selector - Elongated Cards */}
      <motion.div variants={itemVariants} className="space-y-2">
        {dashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className={`group cursor-pointer transition-all duration-200 ${
              selectedDashboard?.id === dashboard.id
                ? "border-pulse/50 bg-pulse/5 shadow-sm"
                : "hover:border-muted-foreground/20 hover:shadow-sm"
            }`}
            onClick={() => setSelectedDashboard(dashboard)}
          >
            <CardContent className="px-3 py-2">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedDashboard?.id === dashboard.id
                    ? "bg-pulse/15 text-pulse"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <BarChartIcon className="size-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium truncate">{dashboard.title}</h3>
                    <Badge
                      variant={dashboard.status === "active" ? "success" : "secondary"}
                      className="shrink-0"
                    >
                      {dashboard.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {dashboard.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    title="Lihat detail"
                    onClick={(e) => handleDetail(e, dashboard)}
                  >
                    <EyeOpenIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    title="Edit dashboard"
                    onClick={(e) => handleEditDashboard(e, dashboard)}
                  >
                    <Pencil1Icon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    title="Hapus"
                    onClick={(e) => handleDeleteDashboard(e, dashboard)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Embedded Dashboard Area */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="border-b bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-pulse/10 flex items-center justify-center">
                  <BarChartIcon className="size-4 text-pulse" />
                </div>
                <div>
                  <CardTitle className="text-sm">{selectedDashboard?.title || "Pilih Dashboard"}</CardTitle>
                  <CardDescription className="text-xs">
                    Disematkan melalui Superset Embedded SDK
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                UUID: {selectedDashboard?.superset_uuid}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 w-full">
            {selectedDashboard?.superset_uuid ? (
              <EmbeddedDashboard
                dashboardUuid={selectedDashboard.superset_uuid}
                title={selectedDashboard.title}
              />
            ) : (
              <div className="relative min-h-[500px] bg-gradient-to-br from-card via-card to-muted/20 flex items-center justify-center">
                <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
                  <div className="size-14 rounded-2xl bg-pulse/10 border border-pulse/20 flex items-center justify-center">
                    <LightningBoltIcon className="size-7 text-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold">Pilih Dashboard</h3>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                      Pilih dashboard dari daftar di atas untuk melihat visualisasi Superset.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5">
          <CardContent className="flex items-start gap-3 py-4">
            <PersonIcon className="size-4 text-pulse mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Catatan integrasi: </span>
              Embed dashboard memerlukan generasi guest token Superset melalui backend FastAPI.
              Lihat endpoint <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">POST /api/superset/guest-token</code>.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Dashboard</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang dashboard yang dipilih
            </DialogDescription>
          </DialogHeader>
          {detailDashboard && (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Judul</span>
                  <span className="text-sm font-medium">{detailDashboard.title}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Deskripsi</span>
                  <span className="text-sm font-medium text-right max-w-[200px]">{detailDashboard.description}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={detailDashboard.status === "active" ? "success" : "secondary"}>
                    {detailDashboard.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Terakhir diperbarui</span>
                  <span className="text-sm font-medium">{new Date(detailDashboard.updated_at).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Superset UUID</span>
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{detailDashboard.superset_uuid}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Tipe</span>
                  <Badge variant="outline">{detailDashboard.is_default ? "Default" : "Custom"}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Endpoint Embed</span>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded">/api/superset/embed/{detailDashboard.id}</code>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dashboard</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <span className="font-medium text-foreground">{deleteTarget?.title}</span>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <div className="size-3 border-2 border-background/30 border-t-background rounded-full animate-spin mr-1.5" />
                  Menghapus...
                </>
              ) : (
                <>
                  <TrashIcon className="size-3 mr-1.5" />
                  Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dashboard Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }} modal={false}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
            <DialogDescription>
              Perbarui informasi dashboard <span className="font-medium text-foreground">{editTarget?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul Dashboard</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Deskripsi</Label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-uuid">Superset Dashboard UUID</Label>
              <Input
                id="edit-uuid"
                value={editUuid}
                onChange={(e) => setEditUuid(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v ?? "active")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Batal
            </Button>
            <Button
              className="bg-pulse hover:bg-pulse/90 text-background"
              onClick={confirmEdit}
              disabled={saving || !editTitle.trim()}
            >
              {saving ? (
                <>
                  <div className="size-3 border-2 border-background/30 border-t-background rounded-full animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
