"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Separator } from "@/components/ui/separator"
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
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  RocketIcon,
  BarChartIcon,
  GlobeIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import * as React from "react"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"
import { DomainsSkeleton } from "@/components/skeletons/domains-skeleton"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} satisfies Variants

const DOMAIN_COLORS = [
  { value: "pulse", label: "Cyan (Default)", class: "bg-pulse/15 text-pulse" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500/15 text-emerald-400" },
  { value: "rose", label: "Rose", class: "bg-rose-500/15 text-rose-400" },
  { value: "amber", label: "Amber", class: "bg-amber-500/15 text-amber-400" },
  { value: "violet", label: "Violet", class: "bg-violet-500/15 text-violet-400" },
  { value: "blue", label: "Blue", class: "bg-blue-500/15 text-blue-400" },
]

interface Domain {
  id: number
  name: string
  description: string
  icon: string | null
  color: string | null
  pipeline_count: number
  dashboard_count: number
}

function getColorClass(color: string | null): string {
  return DOMAIN_COLORS.find((c) => c.value === color)?.class || DOMAIN_COLORS[0].class
}

function DomainFormFields({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  color,
  onColorChange,
}: {
  name: string
  onNameChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  color: string
  onColorChange: (v: string) => void
}) {
  return (
    <div className="space-y-4">
      <FormField label="Nama Domain" htmlFor="domain-name" required>
        <Input
          id="domain-name"
          placeholder="Education, Finance, Healthcare"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </FormField>

      <FormField label="Deskripsi" htmlFor="domain-desc">
        <Input
          id="domain-desc"
          placeholder="Deskripsi singkat tentang domain ini"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </FormField>

      <FormField label="Warna" hint="Warna untuk identitas visual domain">
        <div className="flex gap-2 pt-1">
          {DOMAIN_COLORS.map((c) => (
            <button
              key={c.value}
              className={`size-8 rounded-full border-2 transition-all ${c.class} ${
                color === c.value
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              onClick={() => onColorChange(c.value)}
              title={c.label}
            />
          ))}
        </div>
      </FormField>
    </div>
  )
}

export default function DomainsPage() {
  const [domains, setDomains] = React.useState<Domain[]>([])
  const [loading, setLoading] = React.useState(true)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Domain | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Domain | null>(null)

  const [newName, setNewName] = React.useState("")
  const [newDescription, setNewDescription] = React.useState("")
  const [newColor, setNewColor] = React.useState("pulse")

  const [editName, setEditName] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editColor, setEditColor] = React.useState("pulse")

  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const res = await fetch(`${API_URL}/api/domains`)
      const data = await res.json()
      setDomains(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const token = getAccessToken()
    try {
      await fetch(`${API_URL}/api/domains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          icon: null,
          color: newColor,
        }),
      })
      await fetchDomains()
      setNewName("")
      setNewDescription("")
      setNewColor("pulse")
      setCreateOpen(false)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editTarget || !editName.trim()) return
    setSaving(true)
    const token = getAccessToken()
    try {
      await fetch(`${API_URL}/api/domains/${editTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          icon: editTarget.icon,
          color: editColor,
        }),
      })
      await fetchDomains()
      setEditTarget(null)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const token = getAccessToken()
    try {
      await fetch(`${API_URL}/api/domains/${deleteTarget.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setDomains((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    } catch {
      // ignore
    } finally {
      setDeleteTarget(null)
    }
  }

  const openEdit = (domain: Domain) => {
    setEditTarget(domain)
    setEditName(domain.name)
    setEditDescription(domain.description || "")
    setEditColor(domain.color || "pulse")
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Domain</h1>
          <p className="text-sm text-muted-foreground">
            Kelola domain untuk mengelompokkan pipeline dan dashboard
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-pulse hover:bg-pulse/90 text-background"
        >
          <PlusIcon className="size-3.5 mr-1.5" />
          Buat Domain
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {loading ? (
        <DomainsSkeleton />
      ) : domains.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <GlobeIcon className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Belum ada domain. Buat domain untuk mengelompokkan aset analitik.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon className="size-3.5 mr-1.5" />
                Buat Domain Pertama
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {domains.map((domain) => (
            <motion.div key={domain.id} variants={itemVariants}>
              <Card className="group border-border/40 hover:border-pulse/30 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${getColorClass(domain.color)}`}>
                        <GlobeIcon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{domain.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {domain.description || "Tanpa deskripsi"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RocketIcon className="size-3" />
                      <span>{domain.pipeline_count} pipeline</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BarChartIcon className="size-3" />
                      <span>{domain.dashboard_count} dashboard</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(domain)}
                      >
                        <Pencil1Icon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteTarget(domain)}
                      >
                        <TrashIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Domain Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Domain</DialogTitle>
            <DialogDescription>
              Domain untuk mengelompokkan pipeline dan dashboard.
            </DialogDescription>
          </DialogHeader>
          <DomainFormFields
            name={newName}
            onNameChange={setNewName}
            description={newDescription}
            onDescriptionChange={setNewDescription}
            color={newColor}
            onColorChange={setNewColor}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-pulse hover:bg-pulse/90 text-background"
              onClick={handleCreate}
              disabled={!newName.trim() || saving}
            >
              {saving ? "Menyimpan..." : "Buat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Domain Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Perbarui informasi <span className="font-medium text-foreground">{editTarget?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <DomainFormFields
            name={editName}
            onNameChange={setEditName}
            description={editDescription}
            onDescriptionChange={setEditDescription}
            color={editColor}
            onColorChange={setEditColor}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Batal
            </Button>
            <Button
              className="bg-pulse hover:bg-pulse/90 text-background"
              onClick={handleEdit}
              disabled={!editName.trim() || saving}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah kamu yakin ingin menghapus domain <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
              Pipeline dan dashboard yang terkait tidak akan dihapus, hanya hubungannya yang dilepas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
