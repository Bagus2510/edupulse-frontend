import { Skeleton, SkeletonLine } from "./primitives"

export function AdminUsersSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2"><Skeleton className="h-2.5 w-24" /><Skeleton className="h-8 w-44" /><SkeletonLine className="w-72" /></div>
        <div className="flex items-center gap-2"><Skeleton className="h-6 w-20 rounded-md" /><Skeleton className="h-8 w-28 rounded-md" /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-2.5 w-28" /></div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border border-border bg-card px-4 py-3.5">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-2.5 w-40" /></div>
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-2.5 w-12" />
              <div className="flex gap-1"><Skeleton className="size-7 rounded" /><Skeleton className="size-7 rounded" /></div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-1.5">
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 border border-border p-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-1.5"><Skeleton className="h-2.5 w-14" /><SkeletonLine className="w-full" /></div>)}
      </div>
    </div>
  )
}
