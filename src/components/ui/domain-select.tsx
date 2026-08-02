"use client"

import * as React from "react"
import { ChevronDownIcon, GlobeIcon, ComponentInstanceIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

const DOMAIN_COLORS: Record<string, string> = {
  pulse: "bg-pulse/15 text-pulse",
  emerald: "bg-emerald-500/15 text-emerald-400",
  rose: "bg-rose-500/15 text-rose-400",
  amber: "bg-amber-500/15 text-amber-400",
  blue: "bg-blue-500/15 text-blue-400",
}

interface Domain {
  id: number
  name: string
  color?: string | null
}

interface DomainSelectProps {
  value: string
  onValueChange: (value: string) => void
  domains: Domain[]
  placeholder?: string
  className?: string
}

export function DomainSelect({
  value,
  onValueChange,
  domains,
  placeholder = "Pilih domain",
  className,
}: DomainSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [openUp, setOpenUp] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const selectedDomain = domains.find((d) => String(d.id) === value)

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

  const handleSelect = (val: string) => {
    onValueChange(val)
    setOpen(false)
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
          {selectedDomain ? (
            <>
              <div className={`size-4 rounded flex items-center justify-center shrink-0 ${DOMAIN_COLORS[selectedDomain.color || "pulse"] || DOMAIN_COLORS.pulse}`}>
                <ComponentInstanceIcon className="size-2.5" />
              </div>
              <span className="truncate">{selectedDomain.name}</span>
            </>
          ) : (
            <>
              <GlobeIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="truncate">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn(
          "absolute left-0 right-0 z-50 bg-popover border border-border/60 rounded-lg shadow-md py-1 animate-in fade-in-0 duration-150",
          openUp ? "bottom-full mb-1 slide-in-from-bottom-1" : "top-full mt-1 slide-in-from-top-1"
        )}>
          <button
            type="button"
            className={cn(
              "w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors text-sm",
              !value && "font-medium"
            )}
            onClick={() => handleSelect("")}
          >
            <GlobeIcon className="size-4 text-muted-foreground" />
            <span>Tanpa Domain</span>
          </button>
          {domains.map((domain) => (
            <button
              type="button"
              key={domain.id}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors text-sm",
                String(domain.id) === value && "font-medium"
              )}
              onClick={() => handleSelect(String(domain.id))}
            >
              <div className={`size-4 rounded flex items-center justify-center shrink-0 ${DOMAIN_COLORS[domain.color || "pulse"] || DOMAIN_COLORS.pulse}`}>
                <ComponentInstanceIcon className="size-2.5" />
              </div>
              <span className="truncate">{domain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
