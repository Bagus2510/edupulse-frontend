import { Skeleton, SkeletonCard } from "./primitives"

export function PipelineDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Info card */}
      <SkeletonCard>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-3.5 w-8" />
          </div>
        </div>
      </SkeletonCard>

      {/* Steps section */}
      <SkeletonCard>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/30">
              <Skeleton className="size-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-2.5 w-48" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Run history */}
      <SkeletonCard>
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
              <Skeleton className="size-4 rounded shrink-0" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
