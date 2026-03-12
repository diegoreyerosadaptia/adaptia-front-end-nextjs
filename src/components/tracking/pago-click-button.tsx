"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/ga"

type PagoClickButtonProps = React.ComponentProps<typeof Button> & {
  section: string
  ctaName?: string
  children: React.ReactNode
}

export function PagoClickButton({
  section,
  ctaName = "continuar_al_pago",
  children,
  onClick,
  ...props
}: PagoClickButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("pago_click", {
      page_type: "landing",
      cta_name: ctaName,
      section,
    })

    onClick?.(e)
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}