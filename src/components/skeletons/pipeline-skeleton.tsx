import { Skeleton, SkeletonLine, SkeletonCard } from "./primitives"

export function PipelineSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* DAG cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-full" />
              </div>
              <Skeleton className="size-4 rounded shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="size-8 rounded-md shrink-0" />
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* Run history */}
      <SkeletonCard>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2.5 w-36" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
              <Skeleton className="size-4 rounded shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-40" />
                <Skeleton className="h-2.5 w-12 hidden sm:block" />
                <Skeleton className="h-2.5 w-16 hidden sm:block" />
              </div>
              <Skeleton className="h-4 w-14 rounded-full shrink-0" />
            </div>
          ))}
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
