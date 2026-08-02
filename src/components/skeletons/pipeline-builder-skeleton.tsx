import { Skeleton, SkeletonLine, SkeletonCard } from "./primitives"

export function PipelineBuilderSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Form card */}
      <SkeletonCard>
        <Skeleton className="h-4 w-36" />
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </SkeletonCard>

      {/* Steps section */}
      <SkeletonCard>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/30">
              <Skeleton className="size-6 rounded shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  )
}
