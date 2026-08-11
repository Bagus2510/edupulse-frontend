"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { DomainSelect } from "@/components/ui/domain-select"
import { InlineSelect } from "@/components/ui/inline-select"
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
  CheckCircledIcon,
  OpenInNewWindowIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import * as React from "react"
import { toast } from "sonner"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import { API_URL, SUPERSET_URL } from "@/lib/constants"
import { useDomain } from "@/lib/domain-context"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"

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
  domain_id: number | null
  dependency_count: number
  created_at: string
  updated_at: string
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
          supersetDomain: SUPERSET_URL,
          mountPoint: containerRef.current!,
          fetchGuestToken: async () => {
            const res = await fetch(`${API_URL}/api/superset/guest-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken() || ""}`,
              },
              body: JSON.stringify({ dashboard_uuid: dashboardUuid }),
            })
            if (!res.ok) throw new Error("Gagal mengambil guest token")
            const data = await res.json()
            return data.guest_token
          },
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: true,
            hideChartControls: true,
            hideHeader: false,
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

function DashboardFormFields({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  uuid,
  onUuidChange,
  domainId,
  onDomainChange,
  domains,
  status,
  onStatusChange,
  showStatus,
}: {
  title: string
  onTitleChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  uuid: string
  onUuidChange: (v: string) => void
  domainId: string
  onDomainChange: (v: string) => void
  domains: { id: number; name: string }[]
  status?: string
  onStatusChange?: (v: string) => void
  showStatus?: boolean
}) {
  return (
    <div className="space-y-4">
      <FormField label="Judul Dashboard" htmlFor="dash-title" required>
        <Input
          id="dash-title"
          placeholder="Revenue Analysis"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </FormField>

      <FormField label="Deskripsi" htmlFor="dash-desc">
        <Input
          id="dash-desc"
          placeholder="Monthly revenue trends and forecasts"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </FormField>

      <FormField
        label="Superset Dashboard UUID"
        htmlFor="dash-uuid"
        required
        hint="UUID dari Apache Superset untuk embed dashboard"
      >
        <Input
          id="dash-uuid"
          placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
          value={uuid}
          onChange={(e) => onUuidChange(e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>

      {showStatus && (
        <FormField label="Status" htmlFor="dash-status">
          <InlineSelect
            value={status || "active"}
            onValueChange={(v) => onStatusChange?.(v || "active")}
            options={[
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "error", label: "Error" },
            ]}
            placeholder="Pilih status"
          />
        </FormField>
      )}

      <FormField label="Domain" hint="Kelompokkan dashboard ke domain tertentu">
        <DomainSelect
          value={domainId}
          onValueChange={onDomainChange}
          domains={domains}
          placeholder="Tanpa domain"
        />
      </FormField>
    </div>
  )
}

export default function DashboardPage() {
  const { activeDomainId } = useDomain()
  const user = getCurrentUser()
  const canEdit = hasMinimumRole(user?.role, "editor")
  const canDelete = hasMinimumRole(user?.role, "admin")
  const [dashboards, setDashboards] = React.useState<DashboardItem[]>([])
  const [dashboardPage, setDashboardPage] = React.useState(0)
  const [selectedDashboard, setSelectedDashboard] = React.useState<DashboardItem | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [detailDashboard, setDetailDashboard] = React.useState<DashboardItem | null>(null)
  const [domains, setDomains] = React.useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleteTarget, setDeleteTarget] = React.useState<DashboardItem | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<DashboardItem | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [expandOpen, setExpandOpen] = React.useState(false)

  const [newTitle, setNewTitle] = React.useState("")
  const [newDescription, setNewDescription] = React.useState("")
  const [newUuid, setNewUuid] = React.useState("")
  const [newDomainId, setNewDomainId] = React.useState<string>("")

  const [editTitle, setEditTitle] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editUuid, setEditUuid] = React.useState("")
  const [editDomainId, setEditDomainId] = React.useState<string>("")
  const [editStatus, setEditStatus] = React.useState("active")

  // Dependency validation state
  const [validationResult, setValidationResult] = React.useState<{
    valid: boolean
    total: number
    valid_count: number
    invalid_count: number
    details: Array<{
      mart_table_name: string
      valid: boolean
      pipeline_name: string | null
      pipeline_status: string | null
      error?: string
    }>
  } | null>(null)
  const [validating, setValidating] = React.useState(false)

  React.useEffect(() => {
    fetchDashboards()
    fetchDomains()
  }, [activeDomainId])

  const validateDependencies = async (dashboardId: number) => {
    setValidating(true)
    try {
      const token = getAccessToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_URL}/api/dashboards/${dashboardId}/dependencies/validate`, { headers })
      if (res.ok) {
        const data = await res.json()
        setValidationResult(data)
      }
    } catch {
      // ignore
    } finally {
      setValidating(false)
    }
  }

  async function fetchDashboards() {
    try {
      const url = activeDomainId
        ? `${API_URL}/api/dashboards?domain_id=${activeDomainId}`
        : `${API_URL}/api/dashboards`
      const token = getAccessToken()
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const data = await res.json()
      setDashboards(data)
      setDashboardPage(0)
      if (data.length > 0 && !selectedDashboard) {
        setSelectedDashboard(data[0])
      }
    } catch {
      toast.error("Gagal memuat data dashboard")
    } finally {
      setLoading(false)
    }
  }

  async function fetchDomains() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/domains`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const data = await res.json()
      setDomains(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Gagal memuat data domain")
      setDomains([])
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          superset_uuid: newUuid.trim(),
          status: "pending",
          domain_id: newDomainId ? parseInt(newDomainId) : null,
        }),
      })
      await fetchDashboards()
      setNewTitle("")
      setNewDescription("")
      setNewUuid("")
      setNewDomainId("")
      setDialogOpen(false)
    } catch {
      toast.error("Gagal menambahkan dashboard")
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
      await fetch(`${API_URL}/api/dashboards/${deleteTarget.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getAccessToken() || ""}` } })
      if (selectedDashboard?.id === deleteTarget.id) {
        setSelectedDashboard(null)
      }
      setDeleteTarget(null)
      await fetchDashboards()
    } catch {
      toast.error("Gagal menghapus dashboard")
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
    setEditDomainId(dashboard.domain_id ? String(dashboard.domain_id) : "")
    setEditStatus(dashboard.status)
  }

  const confirmEdit = async () => {
    if (!editTarget || !editTitle.trim()) return
    setSaving(true)
    try {
      await fetch(`${API_URL}/api/dashboards/${editTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          superset_uuid: editUuid.trim(),
          status: editStatus,
          domain_id: editDomainId ? parseInt(editDomainId) : null,
        }),
      })
      setEditTarget(null)
      await fetchDashboards()
    } catch {
      toast.error("Gagal menyimpan perubahan dashboard")
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
      <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse"><BarChartIcon className="size-3" />BI workspace</div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard Analitik</h1>
          <p className="text-sm text-muted-foreground">Dashboard Superset tersemat untuk membaca data mart.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(SUPERSET_URL, "_blank")}>
            <ExternalLinkIcon className="size-3.5 mr-1.5" />
            Buka di Superset
          </Button>
          <Button variant="outline" size="sm" onClick={() => { fetchDashboards(); fetchDomains(); }}>
            <ReloadIcon className="size-3.5 mr-1.5" />
            Segarkan
          </Button>
          {canEdit && <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-pulse hover:bg-pulse/90 text-background gap-1.5">
                <PlusIcon className="size-3.5" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Dashboard</DialogTitle>
                <DialogDescription>
                  Hubungkan dashboard Superset ke halaman ini.
                </DialogDescription>
              </DialogHeader>
              <DashboardFormFields
                title={newTitle}
                onTitleChange={setNewTitle}
                description={newDescription}
                onDescriptionChange={setNewDescription}
                uuid={newUuid}
                onUuidChange={setNewUuid}
                domainId={newDomainId}
                onDomainChange={setNewDomainId}
                domains={domains}
              />
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
          </Dialog>}
        </div>
      </motion.div>

      {/* Dashboard selector */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-medium">Dashboard tersedia</p><p className="mt-0.5 text-[10px] text-muted-foreground">Pilih dashboard untuk membuka visualisasi Superset.</p></div>
          <span className="font-mono text-[10px] text-muted-foreground">{dashboards.length} tersedia</span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {dashboards.slice(dashboardPage * 3, dashboardPage * 3 + 3).map((dashboard) => (
            <Card
              key={dashboard.id}
              className={`group cursor-pointer rounded-md shadow-none transition-all duration-200 ${selectedDashboard?.id === dashboard.id ? "border-pulse/50 bg-pulse/5" : "border-border hover:border-pulse/30"}`}
              onClick={() => setSelectedDashboard(dashboard)}
            >
              <CardContent className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selectedDashboard?.id === dashboard.id ? "bg-pulse/15 text-pulse" : "bg-muted text-muted-foreground"}`}><BarChartIcon className="size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2"><h3 className="truncate text-sm font-medium">{dashboard.title}</h3><Badge variant={dashboard.status === "active" ? "success" : "secondary"} className="shrink-0 rounded-md text-[9px]">{dashboard.status}</Badge></div>
                    <p className="truncate text-xs text-muted-foreground">{dashboard.description || "Tidak ada deskripsi"}</p>
                    {dashboard.dependency_count > 0 && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{dashboard.dependency_count} dependensi</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" title="Lihat detail" onClick={(e) => handleDetail(e, dashboard)}><EyeOpenIcon className="size-3.5" /></Button>
                    {canEdit && <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" title="Edit dashboard" onClick={(e) => handleEditDashboard(e, dashboard)}><Pencil1Icon className="size-3.5" /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" title="Hapus" onClick={(e) => handleDeleteDashboard(e, dashboard)}><TrashIcon className="size-3.5" /></Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {dashboards.length > 3 && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="font-mono text-[10px] text-muted-foreground">Halaman {dashboardPage + 1} / {Math.ceil(dashboards.length / 3)}</span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" className="size-7 rounded-md" disabled={dashboardPage === 0} onClick={() => setDashboardPage((page) => Math.max(0, page - 1))} aria-label="Dashboard sebelumnya"><ChevronLeftIcon className="size-3.5" /></Button>
              <Button type="button" variant="outline" size="icon" className="size-7 rounded-md" disabled={dashboardPage >= Math.ceil(dashboards.length / 3) - 1} onClick={() => setDashboardPage((page) => Math.min(Math.ceil(dashboards.length / 3) - 1, page + 1))} aria-label="Dashboard berikutnya"><ChevronRightIcon className="size-3.5" /></Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Embedded Dashboard Area */}
      <motion.div variants={itemVariants}>
        <Card className="relative group">
          <CardHeader className="border-b border-border bg-muted/20">
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
              <div className="flex items-center gap-2">
                {selectedDashboard?.superset_uuid && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setExpandOpen(true)}
                    title="Perbesar dashboard"
                  >
                    <OpenInNewWindowIcon className="size-4" />
                  </Button>
                )}
                <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                  {selectedDashboard?.superset_uuid ? "Connected" : "Not connected"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 w-full">
            {selectedDashboard?.superset_uuid ? (
              <EmbeddedDashboard
                dashboardUuid={selectedDashboard.superset_uuid}
                title={selectedDashboard.title}
              />
            ) : (
              <div className="relative flex min-h-[500px] items-center justify-center bg-muted/10">
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

              {/* Dependency Validation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Validasi Dependensi</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => validateDependencies(detailDashboard.id)}
                    disabled={validating}
                  >
                    {validating ? (
                      <ReloadIcon className="size-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircledIcon className="size-3 mr-1" />
                    )}
                    Validasi
                  </Button>
                </div>
                {validationResult && (
                  <div className={`rounded-lg border p-3 ${validationResult.valid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.valid ? (
                        <CheckCircledIcon className="size-4 text-emerald-500" />
                      ) : (
                        <CrossCircledIcon className="size-4 text-red-400" />
                      )}
                      <span className="text-sm font-medium">
                        {validationResult.valid ? "Semua dependensi valid" : `${validationResult.invalid_count} dependensi tidak valid`}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {validationResult.total} dependensi total: {validationResult.valid_count} valid, {validationResult.invalid_count} tidak valid
                    </div>
                    {validationResult.details.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {validationResult.details.map((detail) => (
                          <div key={detail.mart_table_name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {detail.valid ? (
                                <CheckCircledIcon className="size-3 text-emerald-500" />
                              ) : (
                                <CrossCircledIcon className="size-3 text-red-400" />
                              )}
                              <span className="font-mono">{detail.mart_table_name}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {detail.valid ? detail.pipeline_name : detail.error}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {detailDashboard.dependency_count === 0 && !validationResult && (
                  <p className="text-xs text-muted-foreground">Belum ada dependensi. Tambahkan dependensi untuk validasi.</p>
                )}
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
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
            <DialogDescription>
              Perbarui informasi <span className="font-medium text-foreground">{editTarget?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <DashboardFormFields
            title={editTitle}
            onTitleChange={setEditTitle}
            description={editDescription}
            onDescriptionChange={setEditDescription}
            uuid={editUuid}
            onUuidChange={setEditUuid}
            domainId={editDomainId}
            onDomainChange={setEditDomainId}
            domains={domains}
            status={editStatus}
            onStatusChange={setEditStatus}
            showStatus
          />
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

      {/* Dashboard Expand Dialog */}
      <Dialog open={expandOpen} onOpenChange={setExpandOpen}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pr-14 py-3.5 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-pulse/10 flex items-center justify-center">
                <BarChartIcon className="size-4 text-pulse" />
              </div>
              <div>
                <DialogTitle className="text-base">{selectedDashboard?.title || "Dashboard"}</DialogTitle>
                <DialogDescription className="text-xs">
                  Tampilan penuh dashboard Superset
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-muted/30">
            {selectedDashboard?.superset_uuid && (
              <EmbeddedDashboard
                dashboardUuid={selectedDashboard.superset_uuid}
                title={selectedDashboard.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
