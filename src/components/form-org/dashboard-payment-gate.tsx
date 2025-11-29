// DashboardPaymentGate.tsx
"use client"

import { useEffect, useState } from "react"
import { PaymentDrawer } from "./payment-drawer"
import { Organization } from "@/types/organization.type"

type Props = {
  openByDefault?: boolean
  token: string
}

export default function DashboardPaymentGate({
  openByDefault = false,
  token,
  children,
}: Props & { children: React.ReactNode }) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(openByDefault)
  const [organization, setOrganization] = useState<Organization | null>(null)

  // Evento desde DashboardOrgList (handlePayment)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        org?: Organization | null
      }

      if (detail?.org) {
        setOrganization(detail.org)
        setIsPaymentOpen(true)
      }
    }

    window.addEventListener("open-payment-drawer", handler as EventListener)
    return () => window.removeEventListener("open-payment-drawer", handler as EventListener)
  }, [])

  // Evento desde login (si lo usás)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        org?: Organization
      }

      if (detail?.org) {
        setOrganization(detail.org)
        setIsPaymentOpen(true)
      }
    }

    window.addEventListener("open-payment-drawer-from-login", handler as EventListener)
    return () => window.removeEventListener("open-payment-drawer-from-login", handler as EventListener)
  }, [])

  useEffect(() => {
    if (openByDefault) {
      setIsPaymentOpen(true)
    }
  }, [openByDefault])

  return (
    <>
      {children}

      {organization && (
        <PaymentDrawer
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          organization={organization}
          token={token}
        />
      )}
    </>
  )
}
