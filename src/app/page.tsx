"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

export default function RootPage() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted) {
      router.replace("/login")
    }
  }, [mounted, router])

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="size-6 rounded-full border-2 border-pulse border-t-transparent animate-spin" />
    </div>
  )
}
