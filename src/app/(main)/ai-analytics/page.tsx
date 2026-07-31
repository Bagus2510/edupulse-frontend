"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { AiAnalyticsSkeleton } from "@/components/skeletons/ai-analytics-skeleton"
import {
  LightningBoltIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PersonIcon,
  PaperPlaneIcon,
  ReloadIcon,
} from "@radix-ui/react-icons"
import { motion, AnimatePresence, type Variants } from "motion/react"
import * as React from "react"
import Markdown from "react-markdown"
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

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function EmbeddedDashboard({ uuid, title }: { uuid: string; title: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const embed = async () => {
      if (!containerRef.current || !uuid) return
      try {
        await embedDashboard({
          supersetDomain: "http://localhost:8088",
          mountPoint: containerRef.current,
          id: uuid,
          fetchGuestToken: async () => {
            const res = await fetch(`${API_URL}/api/superset/guest-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dashboard_uuid: uuid }),
            })
            if (!res.ok) throw new Error("Gagal mengambil guest token")
            const data = await res.json()
            return data.guest_token
          },
          dashboardUiConfig: { hideTitle: true, hideTab: true },
        })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat dashboard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    embed()
    return () => { cancelled = true }
  }, [uuid])

  if (error) {
    return (
      <div className="w-full">
        <div className="border border-border/40 rounded-lg bg-card">
          <div className="min-h-[500px] flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <CrossCircledIcon className="size-10 text-destructive/50" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
      <div
        ref={containerRef}
        className="w-full [&_iframe]:w-full [&_iframe]:min-h-[600px] [&_iframe]:border-0"
      />
    </div>
  )
}

export default function AiAnalyticsPage() {
  const [dashboards, setDashboards] = React.useState<DashboardItem[]>([])
  const [selectedDashboard, setSelectedDashboard] = React.useState<DashboardItem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [deleteTarget, setDeleteTarget] = React.useState<DashboardItem | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 6

  // Chat state
  const [chatInput, setChatInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [isSending, setIsSending] = React.useState(false)
  const [sessionId] = React.useState(() => crypto.randomUUID())
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    fetchDashboards()
  }, [])

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const fetchDashboards = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboards`)
      const data = await res.json()
      setDashboards(data)
      if (data.length > 0) {
        setSelectedDashboard(data[0])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedDashboard || isSending) return

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsSending(true)

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          dashboard_uuid: selectedDashboard.superset_uuid || "",
          session_id: sessionId,
          dashboard_title: selectedDashboard.title,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, assistantMessage])
      } else {
        const errData = await res.json()
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Error: ${errData.detail || "Gagal mengambil respons dari AI"}`,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Error: Gagal terhubung ke server",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await fetch(`${API_URL}/api/ai/chat/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
    } catch {
      // ignore
    }
    setChatMessages([])
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`${API_URL}/api/dashboards/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteTarget(null)
      setChatMessages([])
      await fetchDashboards()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PageSkeletonWrapper skeleton={<AiAnalyticsSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Analisis AI</h1>
          <p className="text-sm text-muted-foreground">
            Chat dengan AI untuk menganalisis data dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-[10px]">
            <LightningBoltIcon className="size-3" />
            Gemini 2.5 Flash
          </Badge>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Dashboard Selector */}
      {(() => {
        const totalPages = Math.ceil(dashboards.length / itemsPerPage)
        const paginatedDashboards = dashboards.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
        return (
          <>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paginatedDashboards.map((dashboard) => (
                <Card
                  key={dashboard.id}
                  className={`group cursor-pointer transition-all duration-200 ${
                    selectedDashboard?.id === dashboard.id
                      ? "border-pulse/50 bg-pulse/5"
                      : "hover:border-muted-foreground/20"
                  }`}
                  onClick={() => {
                    setSelectedDashboard(dashboard)
                    setChatMessages([])
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <CardTitle className="text-sm">{dashboard.title}</CardTitle>
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
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(dashboard)
                            }}
                          >
                            <TrashIcon className="size-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Diperbarui {new Date(dashboard.updated_at).toLocaleDateString("id-ID")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </motion.div>
            )}
          </>
        )
      })()}

      {/* Main Content: Two Columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Dashboard Preview */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden h-full">
            <CardContent className="p-0">
              {selectedDashboard?.superset_uuid ? (
                <EmbeddedDashboard
                  key={selectedDashboard.superset_uuid}
                  uuid={selectedDashboard.superset_uuid}
                  title={selectedDashboard.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center p-8">
                  <div className="size-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <LightningBoltIcon className="size-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Dashboard ini belum terhubung ke Superset</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Chat Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-pulse/10 flex items-center justify-center">
                    <LightningBoltIcon className="size-4 text-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Chat Analisis</CardTitle>
                    <CardDescription className="text-xs">
                      {selectedDashboard ? `${selectedDashboard.title}` : "Pilih dashboard terlebih dahulu"}
                    </CardDescription>
                  </div>
                </div>
                {chatMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={handleClearHistory}
                    title="Hapus riwayat chat"
                  >
                    <ReloadIcon className="size-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
              <AnimatePresence mode="popLayout">
                {chatMessages.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full min-h-[350px] gap-4"
                  >
                    <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <LightningBoltIcon className="size-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium">Mulai percakapan</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Ketik pertanyaan atau klik tombol analisis otomatis
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 mt-2"
                      onClick={() => {
                        setChatInput("Analisis keseluruhan data dashboard ini, berikan ringkasan lengkap")
                      }}
                      disabled={!selectedDashboard}
                    >
                      <LightningBoltIcon className="size-3" />
                      Analisis Otomatis
                    </Button>
                  </motion.div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          msg.role === "user"
                            ? "bg-pulse text-background"
                            : "bg-muted"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                      <div className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </CardContent>

            {/* Chat Input */}
            <div className="border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    selectedDashboard
                      ? "Tanya tentang data dashboard..."
                      : "Pilih dashboard terlebih dahulu"
                  }
                  disabled={!selectedDashboard || isSending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-9 shrink-0 bg-pulse hover:bg-pulse/90 text-background"
                  disabled={!chatInput.trim() || !selectedDashboard || isSending}
                >
                  {isSending ? (
                    <div className="size-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <PaperPlaneIcon className="size-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5">
          <CardContent className="flex items-start gap-3 py-4">
            <PersonIcon className="size-4 text-pulse mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Catatan privasi: </span>
              Hanya data aggregated chart yang dikirim ke AI. Data mentah tidak keluar dari sistem Anda.
              AI terbatas untuk analisis data saja — tidak bisa generate code, gambar, atau apapun selain analisis.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Dashboard</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <span className="font-medium text-foreground">{deleteTarget?.title}</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
