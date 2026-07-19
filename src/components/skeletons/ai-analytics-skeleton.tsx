import { Skeleton, SkeletonLine, SkeletonCard } from "./primitives"

export function AiAnalyticsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-5 w-28 rounded" />
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

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: preview */}
        <div className="lg:col-span-3">
          <SkeletonCard className="overflow-hidden h-full">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="size-14 rounded-2xl" />
                <div className="space-y-1 text-center">
                  <Skeleton className="h-3.5 w-32 mx-auto" />
                  <Skeleton className="h-2.5 w-48 mx-auto" />
                </div>
              </div>
            </div>
          </SkeletonCard>
        </div>

        {/* Right: insight panel */}
        <div className="lg:col-span-2">
          <SkeletonCard className="h-full">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
            <div className="space-y-4 py-4">
              {/* Summary */}
              <SkeletonCard>
                <div className="flex items-start gap-3">
                  <Skeleton className="size-8 rounded-md shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-2 w-20" />
                    <SkeletonLine />
                    <SkeletonLine className="w-4/6" />
                  </div>
                </div>
              </SkeletonCard>
              {/* Findings */}
              <SkeletonCard>
                <Skeleton className="h-3.5 w-24 mb-3" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1.5">
                    <Skeleton className="size-3.5 rounded shrink-0 mt-0.5" />
                    <Skeleton className="h-2.5 flex-1" />
                  </div>
                ))}
              </SkeletonCard>
              {/* Trend + Confidence */}
              <div className="grid grid-cols-2 gap-3">
                <SkeletonCard>
                  <Skeleton className="h-2 w-20 mb-2" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </SkeletonCard>
                <SkeletonCard>
                  <Skeleton className="h-2 w-20 mb-2" />
                  <Skeleton className="h-2 w-full rounded" />
                </SkeletonCard>
              </div>
              {/* Recommendation */}
              <SkeletonCard>
                <Skeleton className="h-3.5 w-28 mb-3" />
                <SkeletonLine />
                <SkeletonLine className="w-5/6" />
              </SkeletonCard>
            </div>
          </SkeletonCard>
        </div>
      </div>

      {/* Button area */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

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
