"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import {
  LightningBoltIcon,
  ExternalLinkIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  FileTextIcon,
  GearIcon,
  BarChartIcon,
  LapTimerIcon,
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

interface SettingsStatus {
  model: string
  configured: boolean
}

export default function SettingsPage() {
  const [status, setStatus] = React.useState<SettingsStatus | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        setStatus(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <PageSkeletonWrapper skeleton={<SettingsSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">
            Status konfigurasi layanan
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Gemini Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                <LightningBoltIcon className="size-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">Google Gemini</CardTitle>
                <CardDescription className="text-xs">Analisis dashboard AI</CardDescription>
              </div>
              {status && (
                <Badge
                  variant={status.configured ? "default" : "secondary"}
                  className={`text-[10px] gap-1 ${
                    status.configured
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status.configured ? (
                    <CheckCircledIcon className="size-3" />
                  ) : (
                    <CrossCircledIcon className="size-3" />
                  )}
                  {status.configured ? "Aktif" : "Belum dikonfigurasi"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-purple-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Model</p>
                    <p className="text-xs text-muted-foreground">Model yang digunakan untuk analisis</p>
                  </div>
                </div>
                <code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
                  {status?.model ?? "—"}
                </code>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`size-1.5 rounded-full shrink-0 ${status?.configured ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <div>
                    <p className="text-sm font-medium">API Key</p>
                    <p className="text-xs text-muted-foreground">Kredensial akses Gemini API</p>
                  </div>
                </div>
                <code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
                  {status?.configured ? "•••••设置于 .env" : "belum diatur"}
                </code>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2.5">
              <GearIcon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                API key dikonfigurasi melalui file <code className="font-mono bg-muted/60 px-1 rounded">.env</code> di backend. 
                Tidak dapat diubah dari antarmuka ini demi keamanan.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tautan Cepat</CardTitle>
            <CardDescription className="text-xs">Akses cepat ke layanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "FastAPI Docs", url: `${API_URL}/api/settings/docs-redirect`, description: "Dokumentasi API backend", icon: FileTextIcon },
              { name: "Apache Superset", url: "http://localhost:8088", description: "BI dashboard & visualisasi", icon: BarChartIcon },
              { name: "Apache Airflow", url: "http://localhost:8080", description: "Orchestration & pipeline", icon: LapTimerIcon },
              { name: "Google AI Studio", url: "https://aistudio.google.com/apikey", description: "Dapatkan Gemini API key", icon: LightningBoltIcon },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-md bg-muted/50 flex items-center justify-center group-hover:bg-pulse/10 transition-colors">
                    <link.icon className="size-3.5 text-muted-foreground group-hover:text-pulse transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-pulse transition-colors">{link.name}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
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
