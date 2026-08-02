"use client"

import * as React from "react"

interface Domain {
  id: number
  name: string
  description: string
  icon: string
  color: string
  pipeline_count: number
  dashboard_count: number
}

interface DomainContextType {
  activeDomainId: number | null
  setActiveDomainId: (id: number | null) => void
  domains: Domain[]
  setDomains: (domains: Domain[]) => void
}

const DomainContext = React.createContext<DomainContextType>({
  activeDomainId: null,
  setActiveDomainId: () => {},
  domains: [],
  setDomains: () => {},
})

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [activeDomainId, setActiveDomainIdState] = React.useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("edupulse_domain_id")
      return saved ? parseInt(saved) : null
    }
    return null
  })
  const [domains, setDomains] = React.useState<Domain[]>([])

  const setActiveDomainId = React.useCallback((id: number | null) => {
    setActiveDomainIdState(id)
    if (id === null) {
      localStorage.removeItem("edupulse_domain_id")
    } else {
      localStorage.setItem("edupulse_domain_id", String(id))
    }
  }, [])

  return (
    <DomainContext.Provider value={{ activeDomainId, setActiveDomainId, domains, setDomains }}>
      {children}
    </DomainContext.Provider>
  )
}

export function useDomain() {
  return React.useContext(DomainContext)
}
