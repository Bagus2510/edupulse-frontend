"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { LineageSkeleton } from "@/components/skeletons/lineage-skeleton"
import { useDomain } from "@/lib/domain-context"
import { API_URL } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { getAccessToken, getCurrentUser } from "@/lib/auth"
import {
  GridIcon,
  RocketIcon,
  TableIcon,
  BarChartIcon,
  LightningBoltIcon,
  ResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

interface LineageNode {
  id: string
  type: "raw" | "pipeline" | "step" | "mart" | "dashboard"
  label: string
  metadata: Record<string, unknown>
}

interface LineageEdge {
  from: string
  to: string
  label: string
}

interface LineageGraph {
  nodes: LineageNode[]
  edges: LineageEdge[]
}

const NODE_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  raw: { bg: "bg-sky-500/10", border: "border-sky-400/30", icon: "text-sky-300" },
  pipeline: { bg: "bg-pulse/10", border: "border-pulse/30", icon: "text-pulse" },
  step: { bg: "bg-pulse/5", border: "border-pulse/20", icon: "text-pulse/80" },
  mart: { bg: "bg-amber-500/10", border: "border-amber-400/30", icon: "text-amber-300" },
  dashboard: { bg: "bg-emerald-500/10", border: "border-emerald-400/30", icon: "text-emerald-300" },
}

const NODE_LABELS: Record<string, string> = {
  raw: "Raw data",
  pipeline: "Pipeline",
  step: "Transform",
  mart: "Data mart",
  dashboard: "Dashboard",
}

const NODE_ICONS: Record<string, React.ReactNode> = {
  raw: <GridIcon className="size-4" />,
  pipeline: <RocketIcon className="size-4" />,
  step: <LightningBoltIcon className="size-3" />,
  mart: <TableIcon className="size-4" />,
  dashboard: <BarChartIcon className="size-4" />,
}

const FRESHNESS_COLORS: Record<string, string> = {
  fresh: "bg-emerald-500",
  stale: "bg-amber-500",
  never_built: "bg-red-500",
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 72
const LAYER_GAP = 280
const NODE_GAP = 100

function LineageGraphCanvas({ data }: { data: LineageGraph }) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [dragging, setDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = React.useState<LineageNode | null>(null)

  // Layout: layered by type
  const layers: LineageNode[][] = React.useMemo(() => {
    const layerOrder = ["raw", "step", "pipeline", "mart", "dashboard"]
    const grouped: Record<string, LineageNode[]> = {}
    for (const node of data.nodes) {
      const key = node.type === "step" ? "step" : node.type
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(node)
    }
    return layerOrder.filter((l) => grouped[l]?.length).map((l) => grouped[l])
  }, [data.nodes])

  // Calculate node positions
  const nodePositions = React.useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    layers.forEach((layer, layerIdx) => {
      const totalHeight = layer.length * NODE_HEIGHT + (layer.length - 1) * (NODE_GAP - NODE_HEIGHT)
      const startY = -totalHeight / 2
      layer.forEach((node, nodeIdx) => {
        positions[node.id] = {
          x: layerIdx * LAYER_GAP,
          y: startY + nodeIdx * NODE_GAP,
        }
      })
    })
    return positions
  }, [layers])

  // Calculate SVG dimensions
  const svgWidth = React.useMemo(() => {
    if (layers.length === 0) return 800
    return (layers.length - 1) * LAYER_GAP + NODE_WIDTH + 200
  }, [layers])

  const svgHeight = React.useMemo(() => {
    let maxNodes = 0
    layers.forEach((l) => { if (l.length > maxNodes) maxNodes = l.length })
    return Math.max(500, maxNodes * NODE_GAP + 200)
  }, [layers])

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.3))
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === "rect") {
      setDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }
  const handleMouseUp = () => setDragging(false)

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((z) => Math.min(Math.max(z + delta, 0.3), 2))
  }

  // Draw edges
  const edges = React.useMemo(() => {
    return data.edges
      .filter((e) => nodePositions[e.from] && nodePositions[e.to])
      .map((e, i) => {
        const from = nodePositions[e.from]
        const to = nodePositions[e.to]
        const x1 = from.x + NODE_WIDTH
        const y1 = from.y + NODE_HEIGHT / 2
        const x2 = to.x
        const y2 = to.y + NODE_HEIGHT / 2
        const midX = (x1 + x2) / 2
        return {
          ...e,
          key: i,
          path: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        }
      })
  }, [data.edges, nodePositions])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--pulse)_12%,transparent),transparent_32%),linear-gradient(to_right,color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />
      <div className="relative border-b border-border/50 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-pulse">
              <span className="size-1.5 rounded-full bg-pulse shadow-[0_0_10px_var(--pulse)]" />
              Data topology
            </div>
            <h2 className="text-base font-semibold tracking-tight">Dependency map</h2>
            <p className="mt-1 text-xs text-muted-foreground">Klik node untuk melihat metadata dan status sumbernya.</p>
          </div>
          <div className="flex items-center gap-1.5 self-start rounded-lg border border-border/60 bg-background/60 p-1 backdrop-blur-sm sm:self-auto">
            <Button variant="ghost" size="icon" className="size-8" onClick={handleZoomIn} title="Perbesar">
          <ZoomInIcon className="size-4" />
        </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={handleZoomOut} title="Perkecil">
              <ZoomOutIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={handleReset} title="Reset">
              <ResetIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/40 px-5 py-3">
        {Object.entries(NODE_COLORS).filter(([k]) => k !== "step").map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${colors.bg} border ${colors.border}`} />
            <span className="text-[10px] font-medium text-muted-foreground">{NODE_LABELS[type]}</span>
          </div>
        ))}
        <span className="ml-auto hidden text-[10px] text-muted-foreground/60 sm:block">Scroll untuk zoom · drag untuk geser</span>
      </div>

      {/* SVG */}
      <div
        className="relative w-full overflow-hidden bg-background/30 cursor-grab active:cursor-grabbing"
        style={{ height: Math.min(svgHeight * zoom + 40, 700) }}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${-pan.x / zoom - 50} ${-pan.y / zoom - 50} ${svgWidth + 100} ${svgHeight + 100}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {/* Edges */}
          {edges.map((edge) => (
            <g key={edge.key}>
              <path
                d={edge.path}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                strokeOpacity="0.3"
                markerEnd="url(#arrowhead)"
              />
            </g>
          ))}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" opacity="0.4" />
            </marker>
          </defs>

          {/* Nodes */}
          {data.nodes.map((node) => {
            const pos = nodePositions[node.id]
            if (!pos) return null
            const colors = NODE_COLORS[node.type] || NODE_COLORS.raw
            const isSelected = selectedNode?.id === node.id

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(isSelected ? null : node)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="8"
                  className={`${colors.bg} ${isSelected ? "ring-2 ring-pulse" : ""}`}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.2"
                />
                <foreignObject x={pos.x + 10} y={pos.y + 8} width={NODE_WIDTH - 20} height={NODE_HEIGHT - 16}>
                  <div className="flex items-center gap-2 h-full">
                    <div className={`${colors.icon} shrink-0`}>
                      {NODE_ICONS[node.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{node.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          {NODE_LABELS[node.type] || node.type}
                        </Badge>
                        {node.type === "mart" && (node.metadata.freshness as string) && (
                          <div className={`size-1.5 rounded-full ${FRESHNESS_COLORS[node.metadata.freshness as string] || ""}`} />
                        )}
                        {typeof node.metadata.row_count === "number" && node.metadata.row_count > 0 && (
                          <span className="text-[9px] text-muted-foreground font-mono">
                            {node.metadata.row_count.toLocaleString()} baris
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <Card className="mt-3">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className={`flex size-7 items-center justify-center rounded-lg ${NODE_COLORS[selectedNode.type]?.bg || "bg-muted"} ${NODE_COLORS[selectedNode.type]?.icon || ""}`}>
                  {NODE_ICONS[selectedNode.type]}
                </span>
                <span className="truncate">{selectedNode.label}</span>
              </CardTitle>
              <Badge variant="outline" className="shrink-0 text-[10px]">{NODE_LABELS[selectedNode.type] || selectedNode.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(selectedNode.metadata).map(([key, value]) => (
                <div key={key}>
                  <p className="text-muted-foreground mb-0.5">{key.replace(/_/g, " ")}</p>
                  <p className="font-medium font-mono">{String(value || "-")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function LineagePage() {
  const router = useRouter()
  const user = getCurrentUser()
  const isViewer = user?.role === "viewer"
  const [data, setData] = React.useState<LineageGraph | null>(null)
  const [loading, setLoading] = React.useState(true)
  const { activeDomainId } = useDomain()

  const lineageStats = React.useMemo(() => {
    const nodes = data?.nodes || []
    return {
      nodes: nodes.length,
      edges: data?.edges.length || 0,
      sources: nodes.filter((node) => node.type === "raw").length,
      outputs: nodes.filter((node) => node.type === "dashboard").length,
    }
  }, [data])

  React.useEffect(() => {
    const fetchLineage = async () => {
      setLoading(true)
      try {
        const token = await getAccessToken()
        const params = new URLSearchParams()
        if (activeDomainId) params.set("domain_id", String(activeDomainId))
        const res = await fetch(`${API_URL}/api/lineage?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          setData(await res.json())
        }
      } catch {}
      setLoading(false)
    }
    fetchLineage()
  }, [activeDomainId])

  React.useEffect(() => {
    if (isViewer) router.push("/home")
  }, [isViewer, router])

  if (isViewer) return null

  return (
    <PageSkeletonWrapper skeleton={<LineageSkeleton />}>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse">
                <span className="size-1.5 rounded-full bg-pulse" />
                Observability / Lineage
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Alur Data</h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Telusuri perjalanan data dari raw table, transformasi pipeline, data mart, hingga dashboard yang menggunakannya.
              </p>
            </div>
            <div className="grid grid-cols-4 divide-x rounded-xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
              {[
                ["Node", lineageStats.nodes],
                ["Relasi", lineageStats.edges],
                ["Sumber", lineageStats.sources],
                ["Output", lineageStats.outputs],
              ].map(([label, value]) => (
                <div key={label} className="min-w-[68px] px-3 py-2.5 text-center first:pl-4 last:pr-4">
                  <p className="font-mono text-base font-semibold tracking-tight">{value}</p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="h-[600px] bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Memuat graf alur data...</p>
            </div>
          ) : data && data.nodes.length > 0 ? (
            <LineageGraphCanvas data={data} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl border border-pulse/20 bg-pulse/10">
                  <div className="absolute inset-2 rounded-xl border border-dashed border-pulse/30" />
                  <RocketIcon className="relative size-7 text-pulse/70" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Belum ada data alur</p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                  Buat pipeline dan hubungkan ke dashboard untuk melihat visualisasi alur data
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </PageSkeletonWrapper>
  )
}
