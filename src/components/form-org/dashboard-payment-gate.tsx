"use client"

import { useEffect, useState } from "react"
import { PaymentDrawer } from "./payment-drawer"
import { Organization } from "@/types/organization.type"

type Props = {
  openByDefault?: boolean
}

export default function DashboardPaymentGate({
  openByDefault = false,
  children,
}: Props & { children: React.ReactNode }) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        checkoutUrl?: string
        org?: Organization | null
      }

      if (detail?.checkoutUrl && detail?.org) {
        setCheckoutUrl(detail.checkoutUrl)
        setOrganization(detail.org)
        setIsPaymentOpen(true)
      }
    }

    window.addEventListener("open-payment-drawer", handler as EventListener)
    return () => window.removeEventListener("open-payment-drawer", handler as EventListener)
  }, [])

  return (
    <>
      {children}

      {/* ✅ Solo renderizamos el Drawer si organization existe */}
      {organization && (
        <PaymentDrawer
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          checkoutUrl={checkoutUrl ?? undefined}
          organization={organization} // 🔥 ya no es null ni undefined
        />
      )}
    </>
  )
}
