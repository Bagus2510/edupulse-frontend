"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  ArrowRightIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClipboardCopyIcon,
  CodeIcon,
  CubeIcon,

  FileTextIcon,

  InfoCircledIcon,
  LightningBoltIcon,
  MagnifyingGlassIcon,

  RocketIcon,
  StackIcon,
} from "@radix-ui/react-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { DocsSkeleton } from "@/components/skeletons/docs-skeleton"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

const sections = [
  { id: "overview", label: "Gambaran umum" },
  { id: "quick-start", label: "Alur kerja" },
  { id: "architecture", label: "Arsitektur" },
  { id: "metadata", label: "Metadata dan quality" },
  { id: "api", label: "Referensi API" },
  { id: "runbook", label: "Runbook" },
]

const architecture = [
  {
    icon: CubeIcon,
    name: "PostgreSQL",
    role: "Storage dan metadata plane",
    detail: "Schema raw menyimpan input. Schema mart menyimpan hasil transformasi. Schema app menyimpan metadata, quality, pipeline, dan dependency.",
  },
  {
    icon: RocketIcon,
    name: "Apache Airflow",
    role: "Orkestrasi pipeline",
    detail: "Menjalankan DAG, mengatur retry, dan melaporkan status run kembali ke EduPulse.",
  },
  {
    icon: BarChartIcon,
    name: "Apache Superset",
    role: "BI dan visualisasi",
    detail: "Menyajikan dashboard dari mart. Dependency dashboard dipakai untuk menghitung impact saat data bermasalah.",
  },
  {
    icon: CodeIcon,
    name: "FastAPI",
    role: "API dan orchestration layer",
    detail: "Menghubungkan frontend, PostgreSQL, Airflow, Superset, quality service, lineage, dan AI evidence.",
  },
  {
    icon: StackIcon,
    name: "Next.js",
    role: "Workspace pengguna",
    detail: "Menyediakan dataset, pipeline, dashboard, lineage, control tower, dan AI analytics.",
  },
]

const endpoints = [
  { method: "GET", path: "/api/datasets", group: "Dataset", detail: "Daftar tabel raw beserta row count dan status quality." },
  { method: "GET", path: "/api/datasets/mart", group: "Dataset", detail: "Daftar tabel mart, freshness, quality, dan waktu build terakhir." },
  { method: "GET", path: "/api/datasets/{schema}.{table}/quality", group: "Quality", detail: "Baca asset metadata, column metadata, dan hasil quality check." },
  { method: "POST", path: "/api/datasets/{schema}.{table}/quality/run", group: "Quality", detail: "Jalankan ulang quality check untuk raw atau mart table." },
  { method: "GET", path: "/api/metadata/assets", group: "Metadata", detail: "Daftar seluruh asset yang terdaftar pada metadata plane." },
  { method: "GET", path: "/api/metadata/assets/{schema}.{table}", group: "Metadata", detail: "Detail asset, kolom, dan quality result." },
  { method: "GET", path: "/api/metadata/metrics", group: "Metadata", detail: "Daftar metric definition yang dapat dipakai lintas analisis." },
  { method: "POST", path: "/api/metadata/metrics", group: "Metadata", detail: "Daftarkan metric dengan formula, grain, unit, dan source asset." },
  { method: "GET", path: "/api/home/summary", group: "Control tower", detail: "Pipeline health, mart freshness, impact dashboard, issue quality, dan AI readiness." },
  { method: "POST", path: "/api/ai/chat/stream", group: "AI evidence", detail: "Stream jawaban AI dan event evidence dari dashboard aktif." },
]

const qualityStates = [
  { state: "passed", label: "Passed", detail: "Semua check yang dijalankan memenuhi batas." },
  { state: "warning", label: "Warning", detail: "Ada anomali yang perlu ditinjau, tetapi asset belum dianggap gagal." },
  { state: "failed", label: "Failed", detail: "Ada check kritikal yang gagal, misalnya asset kosong." },
  { state: "unknown", label: "Unknown", detail: "Metadata tersedia, tetapi quality check belum pernah dijalankan." },
]

const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function DocsPage() {
  const router = useRouter()
  const user = getCurrentUser()
  const isViewer = user?.role === "viewer"
  const isEditor = user?.role === "editor"
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = React.useState("")
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null)

  const filteredEndpoints = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return endpoints
    return endpoints.filter((endpoint) =>
      `${endpoint.method} ${endpoint.path} ${endpoint.group} ${endpoint.detail}`.toLowerCase().includes(normalized),
    )
  }, [query])

  React.useEffect(() => {
    if (isViewer || isEditor) router.push("/home")
  }, [isViewer, isEditor, router])

  async function copyPath(path: string) {
    await navigator.clipboard.writeText(path)
    setCopiedPath(path)
    window.setTimeout(() => setCopiedPath(null), 1600)
  }

  const motionProps = reduceMotion
    ? { initial: false, whileInView: undefined, viewport: undefined }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.12 } }

  if (isViewer || isEditor) return null

  return (
    <PageSkeletonWrapper skeleton={<DocsSkeleton />}>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileTextIcon className="size-4 text-pulse" />
              Dokumentasi
            </div>
            <nav aria-label="Bagian dokumentasi" className="space-y-1 border-l border-border pl-3">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(section.id)}
                  className="h-auto w-full justify-start rounded-md px-2 py-1.5 text-left text-xs font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {section.label}
                </Button>
              ))}
            </nav>
            <div className="border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
              Dokumen ini mengikuti alur implementasi EduPulse saat ini.
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-14">
          <motion.header {...motionProps} variants={reveal} id="overview" className="scroll-mt-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-pulse">
              <span className="size-1.5 rounded-full bg-pulse" aria-hidden="true" />
              Platform guide
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Cara EduPulse menjaga data tetap dapat dipercaya.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                EduPulse menghubungkan dataset, pipeline, data mart, dashboard, lineage, dan AI dalam satu alur operasional.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Next.js", icon: StackIcon },
                { label: "FastAPI", icon: CodeIcon },
                { label: "PostgreSQL", icon: CubeIcon },
                { label: "Airflow", icon: RocketIcon },
                { label: "Superset", icon: BarChartIcon },
              ].map(({ label, icon: Icon }) => (
                <Badge key={label} variant="outline" className="gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px]">
                  <Icon className="size-3" />
                  {label}
                </Badge>
              ))}
            </div>
          </motion.header>

          <motion.section {...motionProps} variants={reveal} id="quick-start" className="scroll-mt-8 space-y-5">
            <SectionHeading title="Alur kerja inti" description="Dari file pertama sampai insight yang memiliki sumber." />
            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-5">
              {[
                ["01", "Upload", "File masuk ke schema raw."],
                ["02", "Inspect", "Metadata kolom dan row count dicatat."],
                ["03", "Transform", "Airflow membangun tabel mart."],
                ["04", "Validate", "Quality dan freshness diperiksa."],
                ["05", "Explain", "Dashboard dan AI memakai evidence."],
              ].map(([number, title, detail]) => (
                <div key={number} className="bg-background p-4 md:min-h-36">
                  <span className="font-mono text-[10px] text-muted-foreground">{number}</span>
                  <h3 className="mt-7 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 border-l-2 border-pulse bg-pulse/5 px-4 py-3 text-sm leading-6">
              <InfoCircledIcon className="mt-1 size-4 shrink-0 text-pulse" />
              <p><strong>Pipeline success bukan berarti data sehat.</strong> Status quality dan freshness harus diperiksa terpisah sebelum dashboard atau AI dipakai untuk keputusan.</p>
            </div>
          </motion.section>

          <motion.section {...motionProps} variants={reveal} id="architecture" className="scroll-mt-8 space-y-5">
            <SectionHeading title="Arsitektur platform" description="Setiap komponen punya batas kerja yang jelas." />
            <div className="divide-y divide-border border-y border-border">
              {architecture.map(({ icon: Icon, name, role, detail }) => (
                <div key={name} className="grid gap-3 py-5 md:grid-cols-[180px_170px_1fr] md:items-start">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4 text-pulse" />
                    {name}
                  </div>
                  <p className="text-xs font-medium text-foreground/80">{role}</p>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section {...motionProps} variants={reveal} id="metadata" className="scroll-mt-8 space-y-5">
            <SectionHeading title="Metadata dan data quality" description="Satu plane untuk menjawab apa datanya, kapan diperbarui, dan layak dipakai atau tidak." />
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-lg border-border shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <CubeIcon className="size-4 text-pulse" />
                    <h3 className="text-sm font-semibold">Asset plane</h3>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">`data_assets` menyimpan identitas asset, owner, row count, freshness, dan quality score.</p>
                  <div className="space-y-2 font-mono text-xs text-muted-foreground">
                    <p><span className="text-foreground">raw.</span> sumber upload</p>
                    <p><span className="text-foreground">mart.</span> hasil pipeline</p>
                    <p><span className="text-foreground">app.</span> metadata dan operasi</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border-border shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircledIcon className="size-4 text-pulse" />
                    <h3 className="text-sm font-semibold">Quality states</h3>
                  </div>
                  <div className="space-y-3">
                    {qualityStates.map((item) => (
                      <div key={item.state} className="grid grid-cols-[70px_1fr] gap-3 text-xs">
                        <Badge variant="outline" className="h-fit justify-center rounded-md px-1.5 py-0.5 font-mono text-[9px]">{item.label}</Badge>
                        <span className="leading-5 text-muted-foreground">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-3 border border-border p-4 text-sm md:grid-cols-3">
              <div><p className="font-mono text-[10px] text-muted-foreground">BI</p><p className="mt-1 leading-5">Lihat mart yang fresh sebelum membaca dashboard.</p></div>
              <div><p className="font-mono text-[10px] text-muted-foreground">ANALYST</p><p className="mt-1 leading-5">Validasi metric, source asset, dan batas data.</p></div>
              <div><p className="font-mono text-[10px] text-muted-foreground">ENGINEER</p><p className="mt-1 leading-5">Telusuri lineage dan impact saat pipeline bermasalah.</p></div>
            </div>
          </motion.section>

          <motion.section {...motionProps} variants={reveal} id="api" className="scroll-mt-8 space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading title="Referensi API" description="Endpoint yang tersedia sekarang, bukan roadmap." />
              <div className="relative w-full md:w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input aria-label="Cari endpoint" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari endpoint atau fungsi" className="h-9 rounded-md pl-9 text-xs" />
              </div>
            </div>
            <div className="overflow-hidden border border-border">
              <div className="hidden grid-cols-[76px_minmax(220px,1fr)_130px_36px] gap-3 border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:grid">
                <span>Method</span><span>Path</span><span>Area</span><span />
              </div>
              {filteredEndpoints.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">Endpoint tidak ditemukan.</div>
              ) : filteredEndpoints.map((endpoint) => (
                <div key={`${endpoint.method}-${endpoint.path}`} className="grid gap-2 border-b border-border px-4 py-3 last:border-0 md:grid-cols-[76px_minmax(220px,1fr)_130px_36px] md:items-center md:gap-3">
                  <Badge variant={endpoint.method === "POST" ? "default" : "secondary"} className="w-fit rounded-md font-mono text-[10px]">{endpoint.method}</Badge>
                  <div className="min-w-0"><code className="break-all text-xs">{endpoint.path}</code><p className="mt-1 text-xs leading-5 text-muted-foreground md:hidden">{endpoint.detail}</p></div>
                  <span className="text-[11px] text-muted-foreground">{endpoint.group}</span>
                  <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`Salin ${endpoint.path}`} onClick={() => void copyPath(endpoint.path)}>
                    {copiedPath === endpoint.path ? <CheckCircledIcon className="size-3.5 text-pulse" /> : <ClipboardCopyIcon className="size-3.5" />}
                  </Button>
                  <p className="hidden text-xs leading-5 text-muted-foreground md:col-span-3 md:block">{endpoint.detail}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section {...motionProps} variants={reveal} id="runbook" className="scroll-mt-8 space-y-5">
            <SectionHeading title="Runbook singkat" description="Urutan pemeriksaan saat hasil belum sesuai." />
            <div className="space-y-0 border-y border-border">
              {[
                ["Upload gagal", "Periksa format file, ukuran, nama tabel, lalu lihat pesan backend. Jika gagal saat metadata sync, cek startup schema app."],
                ["Mart kosong", "Buka detail asset, jalankan quality check, lalu periksa pipeline run dan query destination table."],
                ["Dashboard stale", "Bandingkan last built time dengan freshness status. Telusuri dependency dashboard ke mart terkait."],
                ["Jawaban AI kurang yakin", "Buka evidence panel. Periksa coverage, source chart, row availability, dan limitation sebelum memakai rekomendasi."],
              ].map(([title, detail], index) => (
                <div key={title} className="grid gap-2 border-b border-border py-4 last:border-0 md:grid-cols-[190px_1fr]">
                  <div className="flex items-center gap-2 text-sm font-medium"><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>{title}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 border border-border bg-muted/20 p-4">
              <Button type="button" size="sm" className="rounded-md" onClick={() => window.location.assign("/golden-path")}><RocketIcon className="mr-2 size-3.5" />Jalankan Golden Path</Button>
              <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => window.location.assign("/datasets")}><CubeIcon className="mr-2 size-3.5" />Buka dataset</Button>
              <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => window.location.assign("/lineage")}><ArrowRightIcon className="mr-2 size-3.5" />Lihat lineage</Button>
              <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => window.location.assign("/ai-analytics")}><LightningBoltIcon className="mr-2 size-3.5" />Coba AI evidence</Button>
            </div>
          </motion.section>
        </main>
      </div>
    </PageSkeletonWrapper>
  )
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl space-y-1.5">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}
