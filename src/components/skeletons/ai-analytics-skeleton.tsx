import { Skeleton, SkeletonLine } from "./primitives"

export function AiAnalyticsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2"><Skeleton className="h-2.5 w-24" /><Skeleton className="h-8 w-48" /><SkeletonLine className="w-72" /></div>
        <Skeleton className="h-6 w-32 rounded-md" />
      </div>

      <div className="flex gap-2 overflow-hidden border-b border-border pb-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-52 shrink-0 rounded-md" />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="overflow-hidden border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="size-7 rounded-md" /><div className="space-y-1"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-2.5 w-20" /></div></div><Skeleton className="size-7 rounded-md" /></div>
          <Skeleton className="min-h-[560px] w-full rounded-none" />
        </div>
        <div className="flex min-h-[620px] flex-col overflow-hidden border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="size-7 rounded-md" /><div className="space-y-1"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-2.5 w-32" /></div></div><Skeleton className="size-7 rounded-md" /></div>
          <div className="flex-1 space-y-4 p-4"><div className="flex justify-end"><Skeleton className="h-10 w-48 rounded-lg" /></div><div className="space-y-2"><Skeleton className="h-3 w-20" /><SkeletonLine /><SkeletonLine className="w-4/5" /><Skeleton className="mt-3 h-16 w-full" /></div></div>
          <div className="flex gap-2 border-t border-border p-3"><Skeleton className="h-9 flex-1 rounded-md" /><Skeleton className="size-9 rounded-md" /></div>
        </div>
      </div>

      <div className="flex items-start gap-3 border border-border bg-muted/20 p-4"><Skeleton className="mt-0.5 size-4 rounded" /><SkeletonLine className="flex-1" /></div>
    </div>
  )
}
