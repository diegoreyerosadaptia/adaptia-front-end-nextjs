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
  const [isPaymentOpen, setIsPaymentOpen] = useState(openByDefault)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)

  // 1) Evento normal desde DashboardOrgList (handlePayment)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        checkoutUrl?: string
        org?: Organization | null
      }

      if (detail?.org) {
        if (detail.checkoutUrl) {
          setCheckoutUrl(detail.checkoutUrl)
        }
        setOrganization(detail.org)
        setIsPaymentOpen(true)
      }
    }

    window.addEventListener("open-payment-drawer", handler as EventListener)
    return () => window.removeEventListener("open-payment-drawer", handler as EventListener)
  }, [])

  // 2) Apertura automática al loguearse (desde DashboardPaymentWrapper)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        org?: Organization
      }

      if (detail?.org) {
        setOrganization(detail.org)
        setCheckoutUrl(null) // todavía no tenemos link de pago
        setIsPaymentOpen(true)
      }
    }

    window.addEventListener("open-payment-drawer-from-login", handler as EventListener)
    return () => window.removeEventListener("open-payment-drawer-from-login", handler as EventListener)
  }, [])

  // 3) openByDefault (si quisieras abrir siempre que haya pagos pendientes)
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
          checkoutUrl={checkoutUrl ?? undefined}
          organization={organization}
        />
      )}
    </>
  )
}
