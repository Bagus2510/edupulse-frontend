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
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon as TrashIcon2,
  OpenInNewWindowIcon,
  ExitFullScreenIcon,
} from "@radix-ui/react-icons"
import { motion, AnimatePresence, type Variants } from "motion/react"
import * as React from "react"
import { toast } from "sonner"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import { API_URL, SUPERSET_URL } from "@/lib/constants"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"

function StreamingCursor() {
  return (
    <span
      className="inline-block w-[3px] h-[1.15em] bg-pulse ml-[1px] align-middle -mb-[1px]"
      style={{ animation: "blink 1s step-end infinite" }}
    />
  )
}

function useTypewriter(fullText: string, animate: boolean, onComplete?: () => void) {
  const [displayed, setDisplayed] = React.useState("")
  const indexRef = React.useRef(0)
  const targetRef = React.useRef(fullText)
  const completedRef = React.useRef(false)
  const onCompleteRef = React.useRef(onComplete)

  React.useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // The network stream and the visual typewriter are separate concerns. If
  // the browser buffers the response, the target can still be typed locally.
  React.useEffect(() => {
    targetRef.current = fullText

    if (!animate) {
      indexRef.current = fullText.length
      completedRef.current = true
    } else {
      if (indexRef.current > fullText.length) {
        indexRef.current = fullText.length
      }
      if (fullText.length > indexRef.current) {
        completedRef.current = false
      }
    }
  }, [fullText, animate])

  React.useEffect(() => {
    if (!animate) return

    const timer = setInterval(() => {
      const target = targetRef.current
      if (indexRef.current >= target.length) {
        if (target.length > 0 && !completedRef.current) {
          completedRef.current = true
          onCompleteRef.current?.()
        }
        return
      }

      const remaining = target.length - indexRef.current
      const step = remaining > 80 ? 4 : remaining > 20 ? 3 : 2
      indexRef.current = Math.min(indexRef.current + step, target.length)
      setDisplayed(target.slice(0, indexRef.current))
    }, 18)

    return () => clearInterval(timer)
  }, [animate])

  return animate ? displayed : fullText
}

function EvidencePanel({ evidence }: { evidence: ChatEvidence }) {
  const confidence = Math.round(evidence.confidence * 100)
  return (
    <div className="mt-4 rounded-md border border-pulse/20 bg-pulse/[0.03] p-3 text-[11px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-semibold uppercase tracking-[0.14em] text-pulse">Evidence source</span>
        <a href={evidence.lineage_url} className="text-muted-foreground underline-offset-2 hover:text-pulse hover:underline">
          Lihat lineage
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div><p className="text-muted-foreground">Coverage</p><p className="font-medium">{evidence.data_coverage}</p></div>
        <div><p className="text-muted-foreground">Rows tersedia</p><p className="font-medium font-mono">{evidence.total_rows_available.toLocaleString()}</p></div>
        <div><p className="text-muted-foreground">Confidence</p><p className="font-medium">{confidence}%</p></div>
        <div><p className="text-muted-foreground">Status</p><p className={`font-medium ${evidence.context_status === "ready" ? "text-emerald-500" : "text-amber-500"}`}>{evidence.context_status === "ready" ? "Ready" : "Limited"}</p></div>
      </div>
      {evidence.source_charts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {evidence.source_charts.map((chart) => (
            <span key={`${chart.name}-${chart.viz_type}`} className="rounded-md border border-border/60 bg-background/40 px-2 py-1 text-muted-foreground">
              {chart.name} <span className="font-mono text-foreground/70">({chart.rows})</span>
            </span>
          ))}
        </div>
      )}
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {evidence.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}
      </ul>
    </div>
  )
}

function SimpleMarkdown({ content, isStreaming = false, animate = false, onComplete, evidence }: { content: string; isStreaming?: boolean; animate?: boolean; onComplete?: () => void; evidence?: ChatEvidence }) {
  const displayed = useTypewriter(content, animate, onComplete)
  const normalized = displayed.replace(/\r\n?/g, "\n")
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

  return (
    <div className="text-sm leading-relaxed space-y-1">
      {elements}
      {isStreaming && <StreamingCursor />}
      {evidence && <EvidencePanel evidence={evidence} />}
    </div>
  )
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

interface ChatEvidence {
  dashboard_uuid: string
  source_charts: { name: string; viz_type: string; rows: number }[]
  data_coverage: string
  total_rows_available: number
  confidence: number
  limitations: string[]
  lineage_url: string
  context_status: "ready" | "limited"
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  evidence?: ChatEvidence | null
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
          supersetDomain: SUPERSET_URL,
          mountPoint: containerRef.current,
          id: uuid,
          fetchGuestToken: async () => {
            const res = await fetch(`${API_URL}/api/superset/guest-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken() || ""}`,
              },
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
  const user = getCurrentUser()
  const canEdit = hasMinimumRole(user?.role, "editor")
  const [dashboards, setDashboards] = React.useState<DashboardItem[]>([])
  const [dashboardPage, setDashboardPage] = React.useState(0)
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
  const [typingMessageIndex, setTypingMessageIndex] = React.useState<number | null>(null)
  const [activeEvidence, setActiveEvidence] = React.useState<ChatEvidence | null>(null)
  const networkFinishedRef = React.useRef(false)
  const typewriterFinishedRef = React.useRef(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const handleTypingComplete = React.useCallback(() => {
    typewriterFinishedRef.current = true
    if (networkFinishedRef.current) {
      setIsSending(false)
    }
  }, [])

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

  async function fetchDashboards() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/dashboards`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const data = await res.json()
      setDashboards(data)
      setDashboardPage(0)
      if (data.length > 0) {
        setSelectedDashboard(data[0])
      }
    } catch {
      toast.error("Gagal memuat data dashboard")
    } finally {
      setLoading(false)
    }
  }

  async function fetchSessions(dashboardUuid?: string | null) {
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
      toast.error("Gagal memuat sesi chat")
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
        const messages: ChatMessage[] = data.map((m: { role: string; content: string; timestamp: string; evidence?: ChatEvidence | null }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.timestamp),
          evidence: m.evidence || null,
        })).filter((m: ChatMessage) => {
          // Filter out the hidden context message
          if (m.role === "user" && m.content.includes("Chart data:")) return false
          return true
        })
        setChatMessages(messages)
        setSessionId(sid)
        // History is rendered immediately; only a newly received response types out.
        setTypingMessageIndex(null)
        setActiveEvidence(null)
      }
    } catch {
      toast.error("Gagal memuat riwayat chat")
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
      toast.error("Gagal menghapus sesi chat")
    }
  }

  const newSession = () => {
    setSessionId(crypto.randomUUID())
    setChatMessages([])
    setTypingMessageIndex(null)
    setActiveEvidence(null)
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedDashboard || isSending) return

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    }

    // The assistant will be inserted directly after this user message.
    networkFinishedRef.current = false
    typewriterFinishedRef.current = false
    setTypingMessageIndex(chatMessages.length + 1)
    setActiveEvidence(null)
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
          const eventLine = msg.split("\n").find(l => l.startsWith("event: ")) || ""
          const dataLine = msg.split("\n").find(l => l.startsWith("data: ")) || ""
          const eventName = eventLine.slice(7).trim()
          const chunk = dataLine.slice(6).replace(/\r$/, "")
          if (eventName === "evidence") {
            try { setActiveEvidence(JSON.parse(chunk) as ChatEvidence) } catch { /* ignore malformed metadata */ }
            continue
          }
          if (chunk === "[DONE]") break
          if (!chunk) continue
          try {
            // Backend sends JSON strings so whitespace is not modified by SSE parsing.
            accumulated += JSON.parse(chunk) as string
          } catch {
            // Backward-compatible fallback for an older backend response.
            accumulated += chunk.replace(/\\n/g, "\n")
          }
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
      // Keep the composer locked until the local typewriter also completes.
      networkFinishedRef.current = true
      if (typewriterFinishedRef.current) {
        setIsSending(false)
      }
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
      toast.error("Gagal menghapus riwayat chat")
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
      toast.error("Gagal menghapus dashboard")
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
      toast.error("Gagal menyimpan perubahan dashboard")
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
      <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse">
            <LightningBoltIcon className="size-3" />
            Evidence workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Analisis AI</h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Tanya data dashboard dengan konteks yang dapat ditelusuri, bukan jawaban tanpa sumber.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px]">
          <LightningBoltIcon className="size-3" />
          Gemini 2.5 Flash
        </Badge>
      </motion.div>

      {/* Dashboard context switcher */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-medium">Pilih konteks dashboard</p><p className="mt-0.5 text-[10px] text-muted-foreground">Context menentukan source chart untuk AI</p></div>
          <span className="font-mono text-[10px] text-muted-foreground">{dashboards.length} tersedia</span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {dashboards.slice(dashboardPage * 3, dashboardPage * 3 + 3).map((dashboard) => (
            <Card
              key={dashboard.id}
              className={`group cursor-pointer rounded-md shadow-none transition-all duration-200 ${
                selectedDashboard?.id === dashboard.id
                  ? "border-pulse/60 bg-pulse/5"
                  : "border-border hover:border-pulse/30"
              }`}
              onClick={() => {
                setSelectedDashboard(dashboard)
                setSessionId(crypto.randomUUID())
                setChatMessages([])
                setTypingMessageIndex(null)
                setActiveEvidence(null)
                fetchSessions(dashboard.superset_uuid)
              }}
            >
              <CardContent className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selectedDashboard?.id === dashboard.id ? "bg-pulse/15 text-pulse" : "bg-muted text-muted-foreground"}`}>
                    <BarChartIcon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium">{dashboard.title}</h3>
                      <Badge variant={dashboard.status === "active" ? "success" : "secondary"} className="shrink-0 rounded-md text-[9px]">{dashboard.status}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{dashboard.description || "Tidak ada deskripsi"}</p>
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

      {/* Main Content: dashboard evidence + chat */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        {/* Left: Dashboard Preview */}
        <div>
          <Card className="relative h-full overflow-hidden rounded-lg border-border shadow-none group">
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
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <BarChartIcon className="size-4 text-pulse" />
                <div><p className="text-sm font-medium">Dashboard context</p><p className="text-[11px] text-muted-foreground">{selectedDashboard?.title || "Belum ada dashboard"}</p></div>
              </div>
              <Badge variant="outline" className="rounded-md font-mono text-[9px]">LIVE VIEW</Badge>
            </div>
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
        <div>
          <Card className="flex h-full flex-col rounded-lg border-border shadow-none">
            <CardHeader className="border-b border-pulse/20 bg-pulse/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-pulse/10">
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
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={newSession}
                      title="Chat baru"
                    >
                      <PlusIcon className="size-3.5" />
                    </Button>
                  )}
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
                            {canEdit && (
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
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {chatMessages.length > 0 && canEdit && (
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
                  chatMessages.map((msg, i) => {
                    const isLast = i === chatMessages.length - 1
                    const isStreamingMessage = isLast && isSending && msg.role === "assistant"
                    return (
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
                            <SimpleMarkdown
                              content={msg.content}
                              isStreaming={isStreamingMessage}
                              animate={typingMessageIndex === i}
                              onComplete={typingMessageIndex === i ? handleTypingComplete : undefined}
                              evidence={typingMessageIndex === i ? (activeEvidence || msg.evidence || undefined) : (msg.evidence || undefined)}
                            />
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
              {isSending && chatMessages.length === 0 && (
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
              AI terbatas untuk analisis data saja. AI tidak membuat code, gambar, atau output di luar analisis.
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
              {canEdit && (
                <Button variant="ghost" size="icon" className="size-8" onClick={newSession} title="Chat baru">
                  <PlusIcon className="size-4" />
                </Button>
              )}
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
                        {canEdit && (
                          <Button
                            variant="ghost" size="icon" className="size-5 shrink-0 hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteSessionHandler(s.session_id) }}
                          >
                            <TrashIcon2 className="size-3" />
                          </Button>
                        )}
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
                {chatMessages.map((msg, i) => {
                  const isLast = i === chatMessages.length - 1
                  const isStreamingMessage = isLast && isSending && msg.role === "assistant"
                  return (
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
                          <SimpleMarkdown
                            content={msg.content}
                            isStreaming={isStreamingMessage}
                            animate={typingMessageIndex === i}
                            onComplete={typingMessageIndex === i ? handleTypingComplete : undefined}
                            evidence={typingMessageIndex === i ? (activeEvidence || msg.evidence || undefined) : (msg.evidence || undefined)}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
                {isSending && chatMessages.length === 0 && (
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
