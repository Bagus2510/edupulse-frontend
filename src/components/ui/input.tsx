import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-sm transition-all duration-200",
        "placeholder:text-muted-foreground/50",
        "hover:border-border hover:bg-muted/50",
        "focus:outline-none focus:border-pulse/50 focus:bg-muted/50 focus:ring-2 focus:ring-pulse/10",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-muted/30",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
