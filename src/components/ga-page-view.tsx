"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function GaPageView({ gaId }: { gaId: string }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!gaId) return
    if (typeof window === "undefined") return

    const page_path = `${pathname}${window.location.search}`

    // gtag se define por el script de GA
    // @ts-ignore
    window.gtag?.("config", gaId, { page_path })
  }, [pathname, gaId])

  return null
}
