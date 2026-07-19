import { Skeleton, SkeletonLine, SkeletonCard, SkeletonHeader } from "./primitives"

export function HomeSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SkeletonHeader />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-8 w-24" />
          </SkeletonCard>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Architecture card */}
        <div className="lg:col-span-2">
          <SkeletonCard className="h-full">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-row md:flex-col items-center gap-2 p-3 rounded-lg border border-border/30 flex-1">
                    <Skeleton className="size-8 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-2.5 w-16" />
                      <Skeleton className="h-2 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>

        {/* Activity card */}
        <div>
          <SkeletonCard className="h-full">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-2 rounded-full mt-1 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
