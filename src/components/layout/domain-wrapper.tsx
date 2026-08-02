"use client"

import { DomainProvider } from "@/lib/domain-context"

export function DomainWrapper({ children }: { children: React.ReactNode }) {
  return <DomainProvider>{children}</DomainProvider>
}
