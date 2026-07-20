"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import {
  LightningBoltIcon,
  ExternalLinkIcon,
  CheckCircledIcon,
  ReloadIcon,
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

interface Settings {
  gemini_api_key: string
  gemini_model: string
}

const defaultSettings: Settings = {
  gemini_api_key: "",
  gemini_model: "gemini-2.5-flash",
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<Settings>(defaultSettings)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageSkeletonWrapper skeleton={<SettingsSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">
            Konfigurasi API key untuk analisis AI
          </p>
        </div>
        <Button
          size="sm"
          className="bg-pulse hover:bg-pulse/90 text-background gap-1.5"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ReloadIcon className="size-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircledIcon className="size-3.5" />
          ) : null}
          {saving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan"}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* Gemini Config */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                <LightningBoltIcon className="size-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-sm">Google Gemini</CardTitle>
                <CardDescription className="text-xs">API key untuk analisis dashboard AI</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="AIza..."
                value={settings.gemini_api_key}
                onChange={(e) => setSettings((prev) => ({ ...prev, gemini_api_key: e.target.value }))}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Dapatkan di{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-pulse underline">
                  Google AI Studio
                </a>
                {" "}- free tier: 1,500 req/day
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gemini-model">Model</Label>
              <Input
                id="gemini-model"
                placeholder="gemini-2.5-flash"
                value={settings.gemini_model}
                onChange={(e) => setSettings((prev) => ({ ...prev, gemini_model: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tautan Cepat</CardTitle>
            <CardDescription className="text-xs">Dokumentasi & layanan eksternal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "FastAPI Docs", url: `${API_URL}/docs`, description: "Dokumentasi API backend" },
              { name: "Google AI Studio", url: "https://aistudio.google.com/apikey", description: "Dapatkan Gemini API key" },
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
