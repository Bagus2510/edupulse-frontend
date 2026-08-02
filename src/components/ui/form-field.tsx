"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-[13px] font-medium text-foreground/80"
      >
        {label}
        {required && <span className="text-destructive text-xs">*</span>}
      </label>
      {children}
      {(hint || error) && (
        <p className={cn(
          "text-[11px] leading-relaxed",
          error ? "text-destructive" : "text-muted-foreground/70"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
