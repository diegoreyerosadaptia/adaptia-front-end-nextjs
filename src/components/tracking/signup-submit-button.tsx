"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/ga"

type SignupSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pageType?: string
  signupType?: string
  children: React.ReactNode
}

export function SignupSubmitButton({
  pageType = "register",
  signupType = "manual",
  children,
  onClick,
  ...props
}: SignupSubmitButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("signup_start", {
      page_type: pageType,
      signup_type: signupType,
    })

    onClick?.(e)
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}