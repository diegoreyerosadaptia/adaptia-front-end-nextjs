"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/ga"

type CuentaClickButtonProps = Omit<React.ComponentProps<typeof Button>, "asChild"> & {
  href: string
  section: string
  ctaName?: string
  children: React.ReactNode
  linkClassName?: string
}

export function CuentaClickButton({
  href,
  section,
  ctaName = "login",
  children,
  onClick,
  className,
  variant,
  size,
  disabled,
  linkClassName,
  ...props
}: CuentaClickButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent("cuenta_click", {
      page_type: "landing",
      cta_name: ctaName,
      section,
    })

    onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>)
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      {...props}
    >
      <Link href={href} onClick={handleClick} className={linkClassName}>
        {children}
      </Link>
    </Button>
  )
}