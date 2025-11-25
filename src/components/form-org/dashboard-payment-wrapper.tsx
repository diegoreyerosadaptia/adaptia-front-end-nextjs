"use client"

import { useEffect } from "react"
import type { Organization } from "@/types/organization.type"

type Props = {
  children: React.ReactNode
  organizations: Organization[]
}

export default function DashboardPaymentWrapper({ children, organizations }: Props) {
  useEffect(() => {
    // Si todavía no cargaron las orgs, no hagas nada
    if (!organizations || organizations.length === 0) return

    const pendingOrgId = localStorage.getItem("pending_payment_org")
    if (!pendingOrgId) return

    const org = organizations.find((o) => o.id === pendingOrgId)
    if (!org) {
      console.warn("⚠️ No se encontró organización para pending_payment_org:", pendingOrgId)
      // 👇 importante: NO borramos la key acá, para que pueda volver a intentar
      return
    }

    // ✅ Ahora sí: consumimos la org y borramos la key
    localStorage.removeItem("pending_payment_org")

    window.dispatchEvent(
      new CustomEvent("open-payment-drawer-from-login", {
        detail: { org },
      }),
    )
  }, [organizations])

  return <>{children}</>
}
