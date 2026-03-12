"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/ga"

type RegistroClickButtonProps = React.ComponentProps<typeof Button> & {
  section: string
  ctaName?: string
  children: React.ReactNode
}

export function RegistroClickButton({
  section,
  ctaName = "solicitar_analisis",
  children,
  onClick,
  ...props
}: RegistroClickButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("registro_click", {
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