"use client"

import { useEffect } from "react"
import type { Organization } from "@/types/organization.type"

type Props = {
  children: React.ReactNode
  organizations: Organization[]
}

export default function DashboardPaymentWrapper({ children, organizations }: Props) {
  useEffect(() => {
    const pendingOrgId = localStorage.getItem("pending_payment_org")
    if (!pendingOrgId) return

    // lo consumimos una sola vez
    localStorage.removeItem("pending_payment_org")

    const org = organizations.find((o) => o.id === pendingOrgId)
    if (!org) {
      console.warn("⚠️ No se encontró organización para pending_payment_org:", pendingOrgId)
      return
    }

    // 🔥 ahora mandamos la ORG COMPLETA
    window.dispatchEvent(
      new CustomEvent("open-payment-drawer-from-login", {
        detail: { org },
      }),
    )
  }, [organizations])

  return <>{children}</>
}
