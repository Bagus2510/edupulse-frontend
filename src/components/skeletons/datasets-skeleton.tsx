"use client"

import { SkeletonCard, SkeletonLine, SkeletonCircle } from "@/components/skeletons/primitives"

export function DatasetsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-1">
        <SkeletonLine className="h-8 w-48" />
        <SkeletonLine className="h-4 w-72" />
      </div>

      <SkeletonCard className="h-40" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
