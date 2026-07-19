import { Skeleton, SkeletonLine, SkeletonCard } from "./primitives"

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-56" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Connection status */}
      <SkeletonCard>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-2 rounded-full shrink-0" />
                <div className="space-y-0.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* AI Services */}
      <SkeletonCard>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex items-center gap-3">
            <Skeleton className="size-2 rounded-full shrink-0" />
            <div className="space-y-0.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-4/6" />
      </SkeletonCard>

      {/* User roles */}
      <SkeletonCard>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <div className="space-y-0">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-0.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Quick links */}
      <SkeletonCard>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg">
              <div className="space-y-0.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="size-4 rounded shrink-0" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
