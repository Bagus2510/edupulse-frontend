import { Skeleton, SkeletonLine, SkeletonCard, SkeletonHeader } from "./primitives"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Dashboard selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-full" />
              </div>
              <Skeleton className="h-4 w-14 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-2 w-24" />
          </SkeletonCard>
        ))}
      </div>

      {/* Embedded dashboard area */}
      <SkeletonCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-16 rounded-2xl" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-3 w-64 mx-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-2.5 w-36" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/30 text-center space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-2 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SkeletonCard>

      {/* Info banner */}
      <SkeletonCard>
        <div className="flex items-start gap-3 py-1">
          <Skeleton className="size-4 rounded shrink-0 mt-0.5" />
          <SkeletonLine className="flex-1" />
        </div>
      </SkeletonCard>
    </div>
  )
}
