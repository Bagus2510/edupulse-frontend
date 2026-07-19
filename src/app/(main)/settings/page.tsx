"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import {
  GearIcon,
  PersonIcon,
  LightningBoltIcon,
  ExternalLinkIcon,

} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import * as React from "react"

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

export default function SettingsPage() {
  return (
    <PageSkeletonWrapper skeleton={<SettingsSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi platform dan status koneksi
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Connection Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <LightningBoltIcon className="size-4 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm">Status Koneksi</CardTitle>
                <CardDescription className="text-xs">Cek kesehatan layanan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "PostgreSQL", status: "connected", url: "localhost:5432" },
              { name: "Apache Superset", status: "pending", url: "localhost:8088" },
              { name: "Apache Airflow", status: "pending", url: "localhost:8080" },
              { name: "FastAPI Backend", status: "pending", url: "localhost:8000" },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-2 rounded-full ${
                      service.status === "connected" ? "bg-emerald-500" : "bg-muted-foreground/40"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{service.url}</p>
                  </div>
                </div>
                <Badge variant={service.status === "connected" ? "success" : "secondary"}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Services */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-pulse/10 flex items-center justify-center">
                <LightningBoltIcon className="size-4 text-pulse" />
              </div>
              <div>
                <CardTitle className="text-sm">Layanan AI</CardTitle>
                <CardDescription className="text-xs">
                  Konfigurasi LLM untuk analisis dashboard
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium">Google Gemini</p>
                  <p className="text-xs text-muted-foreground font-mono">Gemini 2.5 Flash (free tier)</p>
                </div>
              </div>
              <Badge variant="secondary">Menunggu backend</Badge>
            </div>
            <div className="py-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                API key disimpan di backend (BFF pattern). Frontend tidak memiliki akses langsung ke API key.
                Konfigurasi <code className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">GEMINI_API_KEY</code> di file <code className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">backend/.env</code>.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Roles */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                <PersonIcon className="size-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-sm">Peran Pengguna</CardTitle>
                <CardDescription className="text-xs">
                  Kontrol akses (Fase 3)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-pulse/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-pulse">A</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Akses penuh ke semua dashboard dan kontrol pipeline</p>
                </div>
              </div>
              <Badge variant="outline">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">V</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Viewer</p>
                  <p className="text-xs text-muted-foreground">Akses baca-saja ke dashboard yang ditugaskan</p>
                </div>
              </div>
              <Badge variant="secondary">Tersedia</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-secondary flex items-center justify-center">
                <GearIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">Tautan Cepat</CardTitle>
                <CardDescription className="text-xs">Dashboard layanan eksternal</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Apache Superset", url: "http://localhost:8088", description: "Pembangun dashboard BI" },
              { name: "Apache Airflow", url: "http://localhost:8080", description: "Orkestrator pipeline" },
              { name: "FastAPI Docs", url: "http://localhost:8000/docs", description: "Dokumentasi API" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium group-hover:text-pulse transition-colors">{link.name}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
                <ExternalLinkIcon className="size-4 text-muted-foreground group-hover:text-pulse transition-colors" />
              </a>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
