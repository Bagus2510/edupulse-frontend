"use client"

import { Skeleton, SkeletonLine, SkeletonCard } from "./primitives"
import * as React from "react"
import { getCurrentUser } from "@/lib/auth"

export function HomeSkeleton() {
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    const user = getCurrentUser()
    setIsAdmin(user?.role === "admin" || user?.role === "editor")
  }, [])

  if (isAdmin) {
    return <AdminHomeSkeleton />
  }
  return <ViewerHomeSkeleton />
}

function ViewerHomeSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-8 w-32" />
        <SkeletonLine className="w-64" />
      </div>

      {/* Stats - 2 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-2.5 w-24" />
          </SkeletonCard>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i}>
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminHomeSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-8 w-32" />
        <SkeletonLine className="w-64" />
      </div>

      {/* Stats grid - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2.5 w-24" />
          </SkeletonCard>
        ))}
      </div>

      {/* Quick Access - 4 cards */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i}>
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-24" />
            </SkeletonCard>
          ))}
        </div>
      </div>

      {/* Control Tower - 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* AI Readiness */}
      <SkeletonCard>
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Recent Activity */}
      <SkeletonCard>
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
