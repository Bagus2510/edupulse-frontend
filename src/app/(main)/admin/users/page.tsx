"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Crosshair2Icon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  Pencil1Icon,
  PersonIcon,
  PlusIcon,
  ReloadIcon,
  ResetIcon,
  TrashIcon,
  ViewHorizontalIcon,
} from "@radix-ui/react-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InlineSelect } from "@/components/ui/inline-select"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { AdminUsersSkeleton } from "@/components/skeletons/admin-users-skeleton"
import { API_URL } from "@/lib/constants"
import { getAccessToken, getCurrentUser, hasMinimumRole } from "@/lib/auth"

interface ManagedUser {
  id: number
  email: string
  full_name: string
  role: "viewer" | "editor" | "admin"
  avatar_initial: string | null
  is_active: boolean
  created_at: string
}

interface PaginatedUsers {
  items: ManagedUser[]
  total: number
  page: number
  limit: number
  total_pages: number
}

type UserForm = {
  email: string
  full_name: string
  password: string
  role: ManagedUser["role"]
  is_active: boolean
}

const emptyForm: UserForm = {
  email: "",
  full_name: "",
  password: "",
  role: "viewer",
  is_active: true,
}

const roleOptions = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
]

const roleDescriptions = {
  viewer: "Baca dashboard, dataset, quality, AI, dan lineage.",
  editor: "Semua hak viewer, plus upload dan operasi pipeline.",
  admin: "Semua hak editor, plus kelola user dan resource.",
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

function headers(json = false): Record<string, string> {
  const token = getAccessToken()
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseResponse(response: Response, action: string) {
  if (response.status === 204) return null
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${action}: ${body.detail || response.statusText}`)
  return body
}

export default function AdminUsersPage() {
  const currentUser = getCurrentUser()
  const isAdmin = hasMinimumRole(currentUser?.role, "admin")
  const [users, setUsers] = React.useState<ManagedUser[]>([])
  const [form, setForm] = React.useState<UserForm>(emptyForm)
  const [editing, setEditing] = React.useState<ManagedUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [deletingUser, setDeletingUser] = React.useState<ManagedUser | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalUsers, setTotalUsers] = React.useState(0)
  const limit = 10

  const loadUsers = React.useCallback(
    async (targetPage = page) => {
      if (!isAdmin) {
        setLoading(false)
        return
      }
      try {
        const data: PaginatedUsers = await parseResponse(
          await fetch(`${API_URL}/api/admin/users?page=${targetPage}&limit=${limit}`, { headers: headers() }),
          "User gagal dimuat",
        )
        setUsers(data.items)
        setTotalPages(data.total_pages)
        setTotalUsers(data.total)
        setPage(data.page)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "User gagal dimuat")
      } finally {
        setLoading(false)
      }
    },
    [isAdmin, page],
  )

  React.useEffect(() => {
    void loadUsers(1)
  }, [])

  const resetForm = () => {
    setEditing(null)
    setForm(emptyForm)
    setError("")
    setNotice("")
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (user: ManagedUser) => {
    if (user.role === "admin") return
    setEditing(user)
    setForm({ email: user.email, full_name: user.full_name, password: "", role: user.role, is_active: user.is_active })
    setError("")
    setNotice("")
    setDialogOpen(true)
  }

  const updateForm = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function saveUser(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const payload = editing
        ? { email: form.email, full_name: form.full_name, role: form.role, is_active: form.is_active, ...(form.password ? { password: form.password } : {}) }
        : form
      const url = editing ? `${API_URL}/api/admin/users/${editing.id}` : `${API_URL}/api/admin/users`
      const method = editing ? "PATCH" : "POST"
      await parseResponse(await fetch(url, { method, headers: headers(true), body: JSON.stringify(payload) }), "User gagal disimpan")
      await loadUsers()
      setDialogOpen(false)
      resetForm()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "User gagal disimpan")
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser() {
    if (!deletingUser) return
    setDeleting(true)
    setError("")
    try {
      await parseResponse(
        await fetch(`${API_URL}/api/admin/users/${deletingUser.id}`, { method: "DELETE", headers: headers() }),
        "User gagal dihapus",
      )
      setDeletingUser(null)
      await loadUsers()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "User gagal dihapus")
    } finally {
      setDeleting(false)
    }
  }

  if (!isAdmin) {
    return <div className="mx-auto max-w-3xl border border-red-400/30 bg-red-400/5 p-6 text-sm text-red-300">Halaman ini khusus admin.</div>
  }

  return (
    <PageSkeletonWrapper skeleton={<AdminUsersSkeleton />}>
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-pulse">
            <LockClosedIcon className="size-3" />
            Admin control
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">User management</h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Kelola akses workspace tanpa mengekspos password. Admin tidak dapat diedit atau dihapus.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="w-fit gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px]">
            <LockClosedIcon className="size-3" />
            {totalUsers} user
          </Badge>
          <Button size="sm" className="gap-1.5 bg-pulse text-background hover:bg-pulse/90" onClick={openCreateDialog}>
            <PlusIcon className="size-3.5" />
            Tambah user
          </Button>
        </div>
      </motion.div>

      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div><p className="text-sm font-semibold">Accounts</p><p className="mt-1 text-xs text-muted-foreground">{totalUsers} user terdaftar</p></div>
          <Button variant="ghost" size="sm" onClick={() => void loadUsers()} disabled={loading} className="gap-1.5"><ReloadIcon className={`size-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-pulse/40 hover:bg-pulse/[0.02]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pulse/10 text-xs font-bold text-pulse">{user.avatar_initial || user.full_name[0]}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{user.full_name}</span><span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">{user.email}</span></span>
              <Badge variant="outline" className="hidden rounded-md font-mono text-[10px] sm:inline-flex">{user.role}</Badge>
              <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${user.is_active ? "text-emerald-400" : "text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-muted-foreground"}`} />{user.is_active ? "active" : "disabled"}</span>
              {user.role !== "admin" ? (
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEditDialog(user)}>
                    <Pencil1Icon className="size-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeletingUser(user)}>
                    <TrashIcon className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <Crosshair2Icon className="size-3.5 text-muted-foreground/40" />
              )}
            </div>
          ))}
          {!users.length && !loading && <div className="border border-dashed border-border rounded-lg px-5 py-12 text-center text-sm text-muted-foreground">Belum ada user.</div>}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="size-8 p-0" disabled={page <= 1} onClick={() => void loadUsers(page - 1)}>
                <ChevronLeftIcon className="size-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">...</span>
                  ) : (
                    <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="size-8 p-0 font-mono text-xs" onClick={() => void loadUsers(p as number)}>
                      {p}
                    </Button>
                  ),
                )}
              <Button variant="outline" size="sm" className="size-8 p-0" disabled={page >= totalPages} onClick={() => void loadUsers(page + 1)}>
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.section>

      <motion.div variants={itemVariants} className="grid gap-3 border border-border p-4 md:grid-cols-3">
        {roleOptions.map((role) => <div key={role.value}><p className="font-mono text-[10px] uppercase tracking-wider text-pulse">{role.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{roleDescriptions[role.value as ManagedUser["role"]]}</p></div>)}
      </motion.div>
    </motion.div>

    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{editing ? "Edit user" : "Tambah user"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi dan hak akses user." : "Buat akun baru untuk akses workspace."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={saveUser} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-email" className="text-xs">Email</Label>
            <div className="relative">
              <EnvelopeClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input id="user-email" type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="user@edupulse.dev" className="pl-9" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-name" className="text-xs">Nama lengkap</Label>
            <Input id="user-name" value={form.full_name} onChange={(event) => updateForm("full_name", event.target.value)} placeholder="Nama pengguna" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <InlineSelect value={form.role} onValueChange={(value) => { if (value) updateForm("role", value as UserForm["role"]) }} options={roleOptions} />
          </div>
          <div className="border border-border bg-muted/20 px-3 py-2.5 text-[11px] leading-5 text-muted-foreground">
            <LockClosedIcon className="mr-1 inline size-3" />{roleDescriptions[form.role]}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-password" className="text-xs">{editing ? "Password baru (opsional)" : "Password"}</Label>
            <Input id="user-password" type="password" minLength={8} value={form.password} onChange={(event) => updateForm("password", event.target.value)} placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"} required={!editing} />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox checked={form.is_active} onCheckedChange={(checked) => updateForm("is_active", checked === true)} />
            Akun aktif
          </label>
          {error && <div role="alert" className="border-l-2 border-red-400 bg-red-400/5 px-3 py-2 text-xs leading-5 text-red-300">{error}</div>}
          {notice && <div className="border-l-2 border-emerald-400 bg-emerald-400/5 px-3 py-2 text-xs leading-5 text-emerald-300">{notice}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving} size="sm" className="gap-1.5 bg-pulse text-background hover:bg-pulse/90">
              {saving ? <ReloadIcon className="size-3.5 animate-spin" /> : editing ? <ResetIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
              {editing ? "Simpan" : "Buat user"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null) }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Hapus user</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. User akan dihapus secara permanen.
          </DialogDescription>
        </DialogHeader>
        {deletingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pulse/10 text-xs font-bold text-pulse">{deletingUser.avatar_initial || deletingUser.full_name[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{deletingUser.full_name}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{deletingUser.email}</p>
              </div>
              <Badge variant="outline" className="rounded-md font-mono text-[10px]">{deletingUser.role}</Badge>
            </div>
            {error && <div role="alert" className="border-l-2 border-red-400 bg-red-400/5 px-3 py-2 text-xs leading-5 text-red-300">{error}</div>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingUser(null)}>Batal</Button>
              <Button type="button" size="sm" variant="destructive" disabled={deleting} onClick={() => void deleteUser()} className="gap-1.5">
                {deleting ? <ReloadIcon className="size-3.5 animate-spin" /> : <TrashIcon className="size-3.5" />}
                Hapus
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    </PageSkeletonWrapper>
  )
}
