import { Skeleton, SkeletonLine } from "./primitives"

export function DocsSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="space-y-2 border-l border-border pl-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={`h-3 ${i === 0 ? "w-28" : "w-24"}`} />)}
          </div>
          <SkeletonLine className="w-32" />
        </div>
      </aside>

      <main className="space-y-14">
        <section className="space-y-5">
          <Skeleton className="h-2.5 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-4/5" />
            <SkeletonLine className="w-3/5" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-md" />)}
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2"><Skeleton className="h-5 w-32" /><SkeletonLine className="w-64" /></div>
          <div className="grid gap-px border border-border md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3 bg-background p-4 md:min-h-36">
                <Skeleton className="h-2.5 w-5" />
                <Skeleton className="mt-7 h-3.5 w-16" />
                <SkeletonLine />
              </div>
            ))}
          </div>
          <div className="flex gap-3 border-l-2 border-border bg-muted/20 px-4 py-3"><Skeleton className="mt-1 size-4 rounded" /><SkeletonLine className="flex-1" /></div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2"><Skeleton className="h-5 w-36" /><SkeletonLine className="w-72" /></div>
          <div className="divide-y divide-border border-y border-border">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="grid gap-3 py-5 md:grid-cols-[180px_170px_1fr]"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-3 w-28" /><SkeletonLine /></div>)}
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2"><Skeleton className="h-5 w-48" /><SkeletonLine className="w-80" /></div>
          <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48 border border-border" /><Skeleton className="h-48 border border-border" /></div>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between"><div className="space-y-2"><Skeleton className="h-5 w-36" /><SkeletonLine className="w-64" /></div><Skeleton className="h-9 w-56 rounded-md" /></div>
          <div className="border border-border">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex gap-3 border-b border-border px-4 py-3 last:border-0"><Skeleton className="h-5 w-12 rounded-md" /><SkeletonLine className="flex-1" /><Skeleton className="h-5 w-20 rounded-md" /></div>)}</div>
        </section>
      </main>
    </div>
  )
}
