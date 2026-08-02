"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InlineSelect } from "@/components/ui/inline-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { AiAnalyticsSkeleton } from "@/components/skeletons/ai-analytics-skeleton"
import {
  LightningBoltIcon,
  CrossCircledIcon,
  TrashIcon,
  PersonIcon,
  PaperPlaneIcon,
  ReloadIcon,
  BarChartIcon,
  Pencil1Icon,
  EyeOpenIcon,
  PlusIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  TrashIcon as TrashIcon2,
  OpenInNewWindowIcon,
  ExitFullScreenIcon,
} from "@radix-ui/react-icons"
import { motion, AnimatePresence, type Variants } from "motion/react"
import * as React from "react"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"

function SimpleMarkdown({ content }: { content: string }) {
  const normalized = content.replace(/\r\n?/g, "\n")
  const lines = normalized.split("\n")
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1">{listItems}</ul>)
      listItems = []
    }
  }

  const renderInline = (text: string) => {
    const parts: React.ReactNode[] = []
    const regex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>)
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    return parts.length > 0 ? parts : text
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()

    if (line.startsWith("## ")) {
      flushList()
      elements.push(<h2 key={i} className="text-base font-semibold mt-4 mb-1 text-foreground">{renderInline(line.slice(3))}</h2>)
    } else if (line.startsWith("### ")) {
      flushList()
      elements.push(<h3 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground">{renderInline(line.slice(4))}</h3>)
    } else if (line.match(/^[-*]\s/)) {
      listItems.push(<li key={i} className="text-muted-foreground">{renderInline(line.slice(2))}</li>)
    } else if (line.trim() === "") {
      flushList()
    } else {
      flushList()
      elements.push(<p key={i} className="text-muted-foreground">{renderInline(line)}</p>)
    }
  }
  flushList()

  return <div className="text-sm leading-relaxed space-y-1">{elements}</div>
}

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

interface ChatSession {
  session_id: string
  title: string
  dashboard_title: string
  dashboard_uuid: string
  created_at: string
  updated_at: string
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
        <div className="absolute inset-0 z-10 min-h-[500px] flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="size-12 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-2 text-center">
            <div className="h-4 w-40 bg-muted rounded animate-pulse mx-auto" />
            <div className="h-3 w-56 bg-muted/60 rounded animate-pulse mx-auto" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="size-1.5 rounded-full bg-pulse/40 animate-pulse" />
            <div className="h-2.5 w-24 bg-muted/60 rounded animate-pulse" />
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
  const [editTarget, setEditTarget] = React.useState<DashboardItem | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editUuid, setEditUuid] = React.useState("")
  const [editStatus, setEditStatus] = React.useState("active")
  const [saving, setSaving] = React.useState(false)

  // Expand dialogs
  const [chatExpandOpen, setChatExpandOpen] = React.useState(false)
  const [dashboardExpandOpen, setDashboardExpandOpen] = React.useState(false)
  const chatExpandEndRef = React.useRef<HTMLDivElement>(null)

  // Chat state
  const [chatInput, setChatInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [isSending, setIsSending] = React.useState(false)
  const [sessionId, setSessionId] = React.useState(() => crypto.randomUUID())
  const [sessions, setSessions] = React.useState<ChatSession[]>([])
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    fetchDashboards()
    fetchSessions()
  }, [])

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  React.useEffect(() => {
    if (chatExpandOpen) chatExpandEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, chatExpandOpen])

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

  const fetchSessions = async (dashboardUuid?: string | null) => {
    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    try {
      const url = dashboardUuid
        ? `${API_URL}/api/ai/chat/sessions?dashboard_uuid=${encodeURIComponent(dashboardUuid)}`
        : `${API_URL}/api/ai/chat/sessions`
      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch {
      // ignore
    }
  }

  const loadSession = async (sid: string) => {
    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    try {
      const res = await fetch(`${API_URL}/api/ai/chat/history/${sid}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const messages: ChatMessage[] = data.map((m: { role: string; content: string; timestamp: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.timestamp),
        })).filter((m: ChatMessage) => {
          // Filter out the hidden context message
          if (m.role === "user" && m.content.includes("Chart data:")) return false
          return true
        })
        setChatMessages(messages)
        setSessionId(sid)
      }
    } catch {
      // ignore
    }
  }

  const deleteSessionHandler = async (sid: string) => {
    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    try {
      await fetch(`${API_URL}/api/ai/chat/sessions/${sid}`, { method: "DELETE", headers })
      setSessions((prev) => prev.filter((s) => s.session_id !== sid))
    } catch {
      // ignore
    }
  }

  const newSession = () => {
    setSessionId(crypto.randomUUID())
    setChatMessages([])
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

    const token = getAccessToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    try {
      const res = await fetch(`${API_URL}/api/ai/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          dashboard_uuid: selectedDashboard.superset_uuid || "",
          session_id: sessionId,
          dashboard_title: selectedDashboard.title,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Gagal mengambil respons dari AI" }))
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Error: ${errData.detail || "Gagal mengambil respons dari AI"}`,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, errorMessage])
        setIsSending(false)
        return
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: new Date() }])

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const messages = buffer.split("\n\n")
        buffer = messages.pop() || ""
        for (const msg of messages) {
          const dataLine = msg.split("\n").find(l => l.startsWith("data: ")) || ""
          const chunk = dataLine.slice(6).trim()
          if (chunk === "[DONE]") break
          if (!chunk) continue
          accumulated += chunk.replace(/\\n/g, "\n")
          setChatMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
              timestamp: new Date(),
            }
            return updated
          })
        }
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
      fetchSessions(selectedDashboard?.superset_uuid)
    }
  }

  const handleClearHistory = async () => {
    const token = getAccessToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`
    try {
      await fetch(`${API_URL}/api/ai/chat/clear`, {
        method: "POST",
        headers,
        body: JSON.stringify({ session_id: sessionId }),
      })
    } catch {
      // ignore
    }
    setChatMessages([])
    newSession()
    fetchSessions(selectedDashboard?.superset_uuid)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    try {
      await fetch(`${API_URL}/api/dashboards/${deleteTarget.id}`, { method: "DELETE", headers })
      setDeleteTarget(null)
      setChatMessages([])
      await fetchDashboards()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const handleEditDashboard = (e: React.MouseEvent, dashboard: DashboardItem) => {
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
    const token = getAccessToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`
    try {
      await fetch(`${API_URL}/api/dashboards/${editTarget.id}`, {
        method: "PUT",
        headers,
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
            onClick={() => {
              setSelectedDashboard(dashboard)
              setChatMessages([])
              fetchSessions(dashboard.superset_uuid)
            }}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDashboard(dashboard)
                      setChatMessages([])
                    }}
                  >
                    <EyeOpenIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content: Two Columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Dashboard Preview */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden h-full relative group">
            {selectedDashboard?.superset_uuid && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 z-10 size-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                onClick={() => setDashboardExpandOpen(true)}
                title="Perbesar dashboard"
              >
                <OpenInNewWindowIcon className="size-4" />
              </Button>
            )}
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setChatExpandOpen(true)}
                    title="Perbesar chat"
                  >
                    <ExitFullScreenIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={newSession}
                    title="Chat baru"
                  >
                    <PlusIcon className="size-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7" title="Riwayat chat">
                        <ChatBubbleIcon className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {sessions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                          Belum ada riwayat
                        </div>
                      ) : (
                        sessions.slice(0, 10).map((s) => (
                          <DropdownMenuItem
                            key={s.session_id}
                            className="flex items-center justify-between gap-2"
                            onClick={() => loadSession(s.session_id)}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">
                                {s.dashboard_title || s.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {new Date(s.updated_at).toLocaleDateString("id-ID", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5 shrink-0 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSessionHandler(s.session_id)
                              }}
                            >
                              <TrashIcon className="size-3" />
                            </Button>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 min-h-[400px] max-h-[600px]">
              <div className="p-4 space-y-4">
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
                          <SimpleMarkdown content={msg.content} />
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
            </div>
            </ScrollArea>

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

      {/* Dashboard Expand Dialog */}
      <Dialog open={dashboardExpandOpen} onOpenChange={setDashboardExpandOpen}>
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
                key={`expand-${selectedDashboard.superset_uuid}`}
                uuid={selectedDashboard.superset_uuid}
                title={selectedDashboard.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Expand Dialog */}
      <Dialog open={chatExpandOpen} onOpenChange={setChatExpandOpen}>
        <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pr-14 py-3.5 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-pulse/10 flex items-center justify-center">
                <LightningBoltIcon className="size-4 text-pulse" />
              </div>
              <div>
                <DialogTitle className="text-base">Chat Analisis</DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedDashboard ? selectedDashboard.title : "Pilih dashboard terlebih dahulu"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={newSession} title="Chat baru">
                <PlusIcon className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" title="Riwayat chat">
                    <ChatBubbleIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {sessions.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                      Belum ada riwayat
                    </div>
                  ) : (
                    sessions.slice(0, 10).map((s) => (
                      <DropdownMenuItem
                        key={s.session_id}
                        className="flex items-center justify-between gap-2 py-2.5 px-3"
                        onClick={() => loadSession(s.session_id)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {s.dashboard_title || s.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(s.updated_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost" size="icon" className="size-5 shrink-0 hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteSessionHandler(s.session_id) }}
                        >
                          <TrashIcon2 className="size-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="px-5 py-5 space-y-5">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="size-14 rounded-2xl bg-pulse/10 flex items-center justify-center mb-4">
                      <LightningBoltIcon className="size-7 text-pulse/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Mulai analisis data</p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[240px]">
                      {selectedDashboard
                        ? "Tanya tentang data dashboard yang dipilih"
                        : "Pilih dashboard terlebih dahulu"}
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-pulse text-background rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <SimpleMarkdown content={msg.content} />
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-2.5">
                      <div className="flex gap-1">
                        <div className="size-1.5 bg-pulse/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="size-1.5 bg-pulse/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="size-1.5 bg-pulse/40 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatExpandEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          <div className="border-t px-5 py-3.5 shrink-0 bg-card/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage() }} className="flex items-center gap-2.5">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={selectedDashboard ? "Tanya tentang data dashboard..." : "Pilih dashboard terlebih dahulu"}
                disabled={!selectedDashboard || isSending}
                className="flex-1 h-10"
              />
              <Button
                type="submit" size="icon" className="size-10 shrink-0 bg-pulse hover:bg-pulse/90 text-background rounded-lg"
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
        </DialogContent>
      </Dialog>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
