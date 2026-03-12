"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/ga"

type PaymentStartedButtonProps = React.ComponentProps<typeof Button> & {
  section: string
  planName?: string
  amountUSD?: number
  paymentProvider?: string
  organizationId?: string
  organizationName?: string
  children: React.ReactNode
}

export function PaymentStartedButton({
  section,
  planName = "analisis_esg",
  amountUSD,
  paymentProvider = "mercado_pago",
  organizationId,
  organizationName,
  children,
  onClick,
  ...props
}: PaymentStartedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("payment_started", {
      page_type: "payment",
      section,
      plan_name: planName,
      value: amountUSD,
      currency: "USD",
      payment_provider: paymentProvider,
      organization_id: organizationId,
      organization_name: organizationName,
    })

    onClick?.(e)
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}