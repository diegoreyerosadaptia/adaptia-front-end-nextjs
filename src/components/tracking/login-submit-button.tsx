"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/ga"

type LoginSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pageType?: string
  loginType?: string
  children: React.ReactNode
}

export function LoginSubmitButton({
  pageType = "login",
  loginType = "manual",
  children,
  onClick,
  ...props
}: LoginSubmitButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("login_submit", {
      page_type: pageType,
      login_type: loginType,
    })

    onClick?.(e)
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}