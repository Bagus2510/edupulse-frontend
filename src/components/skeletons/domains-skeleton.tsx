import { Skeleton, SkeletonCard } from "./primitives"

export function DomainsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Domain cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-2.5 w-36" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-border/30">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-1 ml-auto">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
