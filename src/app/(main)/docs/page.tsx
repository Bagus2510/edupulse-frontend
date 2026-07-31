"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { DocsSkeleton } from "@/components/skeletons/docs-skeleton"
import {
  FileTextIcon,
  RocketIcon,
  GearIcon,
  LightningBoltIcon,
  ExternalLinkIcon,
  CodeIcon,
  CubeIcon,
  BarChartIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"

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

const apiEndpoints = [
  {
    method: "POST",
    path: "/api/superset/guest-token",
    description: "Buat guest token untuk dashboard Superset yang disematkan",
    status: "direncanakan",
  },
  {
    method: "POST",
    path: "/api/airflow/dags/{dag_id}/trigger",
    description: "Jalankan run DAG Airflow",
    status: "direncanakan",
  },
  {
    method: "GET",
    path: "/api/airflow/dags/{dag_id}/status",
    description: "Ambil status run DAG terbaru",
    status: "direncanakan",
  },
]

const architecture = [
  {
    icon: CubeIcon,
    title: "PostgreSQL",
    description: "Data warehouse (skema mentah) + data mart (skema mart)",
    tech: "PostgreSQL",
  },
  {
    icon: RocketIcon,
    title: "Apache Airflow",
    description: "Orkestrasi pipeline ETL dengan run DAG terjadwal",
    tech: "Airflow",
  },
  {
    icon: BarChartIcon,
    title: "Apache Superset",
    description: "Pembangun dashboard BI dengan analitik tersemat",
    tech: "Superset",
  },
  {
    icon: CodeIcon,
    title: "FastAPI",
    description: "Proksi API backend untuk integrasi Superset/Airflow",
    tech: "Python",
  },
  {
    icon: GearIcon,
    title: "Next.js",
    description: "Aplikasi web frontend dengan dashboard tersemat",
    tech: "TypeScript",
  },
]

const phases = [
  {
    phase: "Fase 0",
    title: "PoC",
    description: "Muat CSV OULAD ke PostgreSQL, buat DAG Airflow pertama, bangun dashboard Superset",
    status: "in-progress",
  },
  {
    phase: "Fase 1",
    title: "Integrasi Web",
    description: "Scaffold Next.js + FastAPI, sematkan dashboard Superset melalui guest token",
    status: "pending",
  },
  {
    phase: "Fase 2",
    title: "Kontrol Pipeline",
    description: "Jalankan run DAG dari aplikasi web, pantau status pipeline dengan polling",
    status: "pending",
  },
  {
    phase: "Fase 3",
    title: "Penguatan",
    description: "Sistem autentikasi, keamanan level baris, Docker Compose, dokumentasi lengkap",
    status: "pending",
  },
]

export default function DocsPage() {
  return (
    <PageSkeletonWrapper skeleton={<DocsSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-pulse/10 border border-pulse/20">
            <FileTextIcon className="size-5 text-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dokumentasi</h1>
            <p className="text-sm text-muted-foreground">
              Ikhtisar proyek, arsitektur, dan referensi API
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Project Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ikhtisar Proyek</CardTitle>
            <CardDescription>Apa itu EduPulse Analytics?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              EduPulse Analytics adalah proyek portofolio teknis pribadi yang mensimulasikan alur kerja platform data modern.
              Data mentah memasuki data warehouse, diproses secara terjadwal melalui orkestrator, disajikan melalui data mart,
              divisualisasikan melalui alat BI, dan diakses melalui aplikasi web kustom.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="secondary">FastAPI</Badge>
              <Badge variant="secondary">PostgreSQL</Badge>
              <Badge variant="secondary">Apache Airflow</Badge>
              <Badge variant="secondary">Apache Superset</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Architecture */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Arsitektur</CardTitle>
            <CardDescription>Komponen platform dan alur data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architecture.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg border hover:border-pulse/30 transition-colors">
                  <div className="size-9 rounded-md bg-pulse/10 flex items-center justify-center shrink-0">
                    <item.icon className="size-4 text-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">{item.tech}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Development Phases */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fase Pengembangan</CardTitle>
            <CardDescription>Roadmap proyek dan kemajuan saat ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {phases.map((phase) => (
              <div key={phase.phase} className="flex items-start gap-4 p-3 rounded-lg border">
                <div className="flex flex-col items-center">
                  <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    phase.status === "in-progress"
                      ? "bg-pulse/15 text-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {phase.phase.split(" ")[1]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{phase.title}</p>
                    <Badge
                      variant={phase.status === "in-progress" ? "pulse" : "secondary"}
                      className="text-[10px]"
                    >
                      {phase.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* API Endpoints */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endpoint API</CardTitle>
            <CardDescription>Endpoint backend FastAPI untuk integrasi frontend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.path} className="flex items-center gap-3 p-3 rounded-lg border font-mono text-sm">
                <Badge
                  variant={endpoint.method === "POST" ? "default" : "secondary"}
                  className="text-[10px] shrink-0"
                >
                  {endpoint.method}
                </Badge>
                <code className="text-xs flex-1 truncate">{endpoint.path}</code>
                <Badge variant="outline" className="text-[10px] shrink-0">{endpoint.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dataset */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dataset</CardTitle>
            <CardDescription>OULAD - Open University Learning Analytics Dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "studentInfo", desc: "Demografi & hasil" },
                { name: "studentRegistration", desc: "Tanggal pendaftaran" },
                { name: "studentAssessment", desc: "Nilai penilaian" },
                { name: "assessments", desc: "Metadata penilaian" },
                { name: "studentVle", desc: "Log interaksi VLE" },
                { name: "courses", desc: "Metadata kursus" },
              ].map((table) => (
                <div key={table.name} className="p-2 rounded border bg-card/50">
                  <code className="text-xs font-mono text-pulse">{table.name}</code>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{table.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <Card className="border-pulse/20 bg-pulse/5">
          <CardContent className="flex items-center gap-3 py-4">
            <LightningBoltIcon className="size-4 text-pulse shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Akses cepat: </span>
              Kunjungi{" "}
              <a href="/dashboard" className="text-pulse hover:underline cursor-pointer">Dashboard Analitik</a>{" "}
              untuk melihat dashboard Superset tersemat, atau{" "}
              <a href="/pipeline" className="text-pulse hover:underline cursor-pointer">Kontrol Pipeline</a>{" "}
              untuk menjalankan run ETL.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
