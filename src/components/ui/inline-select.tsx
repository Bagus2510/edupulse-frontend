"use client"

import * as React from "react"
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface InlineSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface InlineSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: InlineSelectOption[]
  placeholder?: string
  className?: string
}

export function InlineSelect({
  value,
  onValueChange,
  options,
  placeholder = "Pilih",
  className,
}: InlineSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [openUp, setOpenUp] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 150)
    }
    setOpen(!open)
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors",
          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/50",
          !value && "text-muted-foreground"
        )}
        onClick={handleOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected?.icon}
          <span className="truncate">{selected?.label || placeholder}</span>
        </div>
        <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn(
          "absolute left-0 right-0 z-50 bg-popover border border-border/60 rounded-lg shadow-md py-1 animate-in fade-in-0 duration-150",
          openUp ? "bottom-full mb-1 slide-in-from-bottom-1" : "top-full mt-1 slide-in-from-top-1"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors text-sm",
                option.value === value && "font-medium"
              )}
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
              }}
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span className="flex-1 truncate">{option.label}</span>
              {option.value === value && <CheckIcon className="size-4 shrink-0 text-pulse" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
