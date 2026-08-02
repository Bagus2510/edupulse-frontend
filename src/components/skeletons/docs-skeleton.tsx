import { Skeleton, SkeletonLine, SkeletonCard, SkeletonHeader } from "./primitives"

export function DocsSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <SkeletonHeader />

      <Skeleton className="h-px w-full" />

      {/* Project overview */}
      <SkeletonCard>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2.5 w-40" />
        <div className="space-y-2">
          <SkeletonLine />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-4/6" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded" />
          ))}
        </div>
      </SkeletonCard>

      {/* Architecture */}
      <SkeletonCard>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2.5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/30">
              <Skeleton className="size-9 rounded-md shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Phases */}
      <SkeletonCard>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2.5 w-36" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg border border-border/30">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* API endpoints */}
      <SkeletonCard>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-2.5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/30">
              <Skeleton className="h-5 w-12 rounded shrink-0" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-4 w-20 rounded shrink-0" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Dataset */}
      <SkeletonCard>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2.5 w-56" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-2 rounded border border-border/30 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Quick links */}
      <SkeletonCard>
        <div className="flex items-center gap-3 py-1">
          <Skeleton className="size-4 rounded shrink-0" />
          <SkeletonLine className="flex-1" />
        </div>
      </SkeletonCard>
    </div>
  )
}
