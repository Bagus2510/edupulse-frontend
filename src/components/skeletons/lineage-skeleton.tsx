import { Skeleton, SkeletonCard, SkeletonLine } from "./primitives"

export function LineageSkeleton() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-1.5 rounded-full" />
            <Skeleton className="h-2.5 w-32" />
          </div>
          <Skeleton className="h-7 w-40" />
          <SkeletonLine className="w-80" />
        </div>
        <div className="grid grid-cols-4 divide-x rounded-xl border border-border/60 bg-card/60">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[68px] px-3 py-2.5 text-center first:pl-4 last:pr-4">
              <Skeleton className="h-5 w-12 mx-auto" />
              <Skeleton className="h-2.5 w-12 mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="relative border-b border-border/50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 p-1">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/40 px-5 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>

        <div className="h-[500px] bg-background/30 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
