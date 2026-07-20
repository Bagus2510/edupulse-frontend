"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"
import {
  BarChartIcon,
  ReloadIcon,
  ExternalLinkIcon,
  LightningBoltIcon,
  PersonIcon,
  MixIcon,
  PlusIcon,
  TrashIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import * as React from "react"
import { API_URL } from "@/lib/constants"

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

  const handleDeleteDashboard = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await fetch(`${API_URL}/api/dashboards/${id}`, { method: "DELETE" })
      await fetchDashboards()
    } catch {
      // ignore
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

      {/* Dashboard Selector */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className={`cursor-pointer transition-all duration-200 group ${
              selectedDashboard?.id === dashboard.id
                ? "border-pulse/50 bg-pulse/5"
                : "hover:border-muted-foreground/20"
            }`}
            onClick={() => setSelectedDashboard(dashboard)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-sm truncate">{dashboard.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{dashboard.description}</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <Badge
                    variant={dashboard.status === "active" ? "success" : "secondary"}
                  >
                    {dashboard.status}
                  </Badge>
                  {!dashboard.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDeleteDashboard(e, dashboard.id)}
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Diperbarui {new Date(dashboard.updated_at).toLocaleDateString("id-ID")}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono truncate" title={dashboard.superset_uuid || ""}>
                UUID: {dashboard.superset_uuid}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 h-7 text-xs gap-1.5 cursor-pointer"
                onClick={(e) => handleDetail(e, dashboard)}
              >
                <InfoCircledIcon className="size-3" />
                Detail
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Embedded Dashboard Area */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
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
          <CardContent className="p-0">
            {/* Superset Embed Placeholder */}
            <div className="relative min-h-[500px] bg-gradient-to-br from-card via-card to-muted/20 flex items-center justify-center">
              {/* Grid pattern background */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-6 p-8 max-w-lg text-center">
                <div className="size-16 rounded-2xl bg-pulse/10 border border-pulse/20 flex items-center justify-center">
                  <LightningBoltIcon className="size-8 text-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Embed Dashboard Superset</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Area ini akan merender dashboard Apache Superset yang disematkan setelah integrasi backend selesai. Dashboard diambil melalui guest token dan ditampilkan dalam iframe.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  Menunggu koneksi Superset
                </div>
                <div className="w-full grid grid-cols-3 gap-3 mt-2">
                  <div className="p-3 rounded-lg border bg-card/50 text-center">
                    <MiniBarChart />
                    <p className="text-[10px] text-muted-foreground mt-2">Distribusi Nilai</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card/50 text-center">
                    <MiniLineChart />
                    <p className="text-[10px] text-muted-foreground mt-2">Tren Interaksi</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card/50 text-center flex flex-col items-center justify-center">
                    <MiniDonut />
                    <p className="text-[10px] text-muted-foreground mt-2">Tingkat Kelulusan</p>
                  </div>
                </div>
              </div>
            </div>
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
    </motion.div>
    </PageSkeletonWrapper>
  )
}
