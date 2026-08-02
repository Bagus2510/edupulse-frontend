"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, ComponentInstanceIcon, GlobeIcon } from "@radix-ui/react-icons"
import { useDomain } from "@/lib/domain-context"
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"
import { cn } from "@/lib/utils"

const DOMAIN_COLORS: Record<string, string> = {
  pulse: "bg-pulse/15 text-pulse",
  emerald: "bg-emerald-500/15 text-emerald-400",
  rose: "bg-rose-500/15 text-rose-400",
  amber: "bg-amber-500/15 text-amber-400",
  blue: "bg-blue-500/15 text-blue-400",
}

export function DomainSwitcher() {
  const { activeDomainId, setActiveDomainId, domains, setDomains } = useDomain()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const fetchDomains = async () => {
      try {
        const token = await getAccessToken()
        const res = await fetch(`${API_URL}/api/domains`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setDomains(data)
        }
      } catch {}
    }
    fetchDomains()
  }, [setDomains])

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

  const activeDomain = domains.find((d) => d.id === activeDomainId)

  const handleSelect = (id: number | null) => {
    setActiveDomainId(id)
    setOpen(false)
  }

  return (
    <div ref={ref}>
      <Button
        variant="ghost"
        className="w-full justify-between px-2 py-1.5 h-auto text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`size-6 rounded-md flex items-center justify-center shrink-0 ${DOMAIN_COLORS[activeDomain?.color || "pulse"] || DOMAIN_COLORS.pulse}`}>
            <GlobeIcon className="size-3" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">
              {activeDomain?.name || "Semua Domain"}
            </p>
          </div>
        </div>
        <ChevronDownIcon className={cn("size-3 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="mt-1 bg-popover border border-border/60 rounded-lg shadow-md py-1 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <button
            className="w-full px-2 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors"
            onClick={() => handleSelect(null)}
          >
            <GlobeIcon className="size-3.5 text-muted-foreground" />
            <span className={cn("text-sm", !activeDomainId ? "font-medium" : "")}>Semua Domain</span>
          </button>
          {domains.map((domain) => (
            <button
              key={domain.id}
              className="w-full px-2 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors"
              onClick={() => handleSelect(domain.id)}
            >
              <div className={`size-5 rounded flex items-center justify-center ${DOMAIN_COLORS[domain.color] || DOMAIN_COLORS.pulse}`}>
                <ComponentInstanceIcon className="size-2.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={cn("text-sm", activeDomainId === domain.id ? "font-medium" : "")}>{domain.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
