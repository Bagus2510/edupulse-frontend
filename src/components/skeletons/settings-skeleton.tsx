import { Skeleton, SkeletonLine, SkeletonCard } from "./primitives"

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Gemini Status Card */}
      <SkeletonCard>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Skeleton className="size-1.5 rounded-full shrink-0" />
              <div className="space-y-0.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
            <Skeleton className="h-5 w-28 rounded" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-1.5 rounded-full shrink-0" />
              <div className="space-y-0.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 rounded" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </SkeletonCard>

      {/* Quick links */}
      <SkeletonCard>
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="size-7 rounded-md" />
                <div className="space-y-0.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="size-4 rounded shrink-0" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
