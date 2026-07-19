import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  )
}

function SkeletonLine({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("h-3 w-full", className)} {...props} />
}

function SkeletonCircle({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("size-8 rounded-full", className)} {...props} />
}

function SkeletonCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("rounded-lg border border-border/40 bg-card/30 p-4 space-y-3", className)} {...props}>
      {children}
    </div>
  )
}

function SkeletonHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <Skeleton className="size-10 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonLine, SkeletonCircle, SkeletonCard, SkeletonHeader }
