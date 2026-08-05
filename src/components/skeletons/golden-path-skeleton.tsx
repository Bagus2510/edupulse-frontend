import { Skeleton, SkeletonLine } from "./primitives"

export function GoldenPathSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-8 w-40" /><SkeletonLine className="w-80" /></div>
        <Skeleton className="h-6 w-28 rounded-md" />
      </div>

      <div className="grid gap-px border border-border bg-border md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background px-5 py-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-5" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="mt-6 h-4 w-24" />
            <Skeleton className="mt-2 h-2.5 w-14" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden border border-border">
          <div className="border-b border-border px-4 py-3"><Skeleton className="h-4 w-28" /></div>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3 border border-border bg-muted/20 px-4 py-3"><Skeleton className="size-4 rounded" /><Skeleton className="h-9 flex-1 rounded-md" /></div>
            <div className="grid gap-3 border border-border bg-muted/20 p-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-1"><Skeleton className="h-2.5 w-12" /><Skeleton className="h-3.5 w-28" /></div>)}
            </div>
            <div className="flex gap-2"><Skeleton className="h-10 w-32 rounded-md" /><Skeleton className="h-10 w-40 rounded-md" /></div>
          </div>
        </div>
        <div className="overflow-hidden border border-border">
          <div className="border-b border-border px-4 py-3"><Skeleton className="h-4 w-24" /></div>
          <div className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} className={i === 3 ? "w-4/5" : ""} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
