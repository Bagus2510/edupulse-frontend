"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { API_URL } from "./constants"

const ACCESS_KEY = "edupulse_access_token"
const REFRESH_KEY = "edupulse_refresh_token"
const USER_KEY = "edupulse_user"

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  avatar_initial: string
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function parseJWT(token: string): { exp: number } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return { exp: payload.exp }
  } catch {
    return null
  }
}

function scheduleRefresh(accessToken: string) {
  if (refreshTimer) clearTimeout(refreshTimer)
  const parsed = parseJWT(accessToken)
  if (!parsed) return
  const now = Math.floor(Date.now() / 1000)
  const refreshIn = (parsed.exp - now - 60) * 1000
  if (refreshIn > 0) {
    refreshTimer = setTimeout(() => refreshAccessToken(), refreshIn)
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem(ACCESS_KEY, data.access_token)
    localStorage.setItem(REFRESH_KEY, data.refresh_token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    scheduleRefresh(data.access_token)
    return true
  } catch {
    return false
  }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_KEY)
    const refreshToken = localStorage.getItem(REFRESH_KEY)

    if (!accessToken || !refreshToken) {
      router.replace("/login")
      return
    }

    const parsed = parseJWT(accessToken)
    if (!parsed) {
      clearAuth()
      router.replace("/login")
      return
    }

    const now = Math.floor(Date.now() / 1000)
    if (parsed.exp < now) {
      refreshAccessToken().then((ok) => {
        if (!ok) {
          clearAuth()
          router.replace("/login")
        } else {
          scheduleRefresh(localStorage.getItem(ACCESS_KEY)!)
          setChecking(false)
        }
      })
    } else {
      scheduleRefresh(accessToken)
      setChecking(false)
    }
  }, [pathname, router])

  React.useEffect(() => {
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [])

  if (checking) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 border-2 border-pulse/20 border-t-pulse rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

export function setAuth(accessToken: string, refreshToken: string, user: User) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  scheduleRefresh(accessToken)
}

export function clearAuth() {
  if (refreshTimer) clearTimeout(refreshTimer)
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(ACCESS_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
