"use client"

import { useState, useEffect, type ReactNode } from "react"

export function PageSkeletonWrapper({
  skeleton,
  children,
  delay = 800,
}: {
  skeleton: ReactNode
  children: ReactNode
  delay?: number
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (loading) return <>{skeleton}</>
  return <>{children}</>
}
