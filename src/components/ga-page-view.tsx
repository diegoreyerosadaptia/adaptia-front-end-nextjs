"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function GaPageView({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!gaId || typeof window === "undefined" || typeof window.gtag !== "function") return

    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [gaId, pathname, searchParams])

  return null
}