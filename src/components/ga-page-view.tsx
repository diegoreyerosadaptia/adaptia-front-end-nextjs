"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function GaPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID) return

    const qs = searchParams?.toString()
    const page_path = qs ? `${pathname}?${qs}` : pathname

    // @ts-ignore
    window.gtag?.("event", "page_view", { page_path })
  }, [pathname, searchParams])

  return null
}
