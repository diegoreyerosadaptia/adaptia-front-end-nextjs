"use client"

import { useEffect, useRef } from "react"
import { trackEvent } from "@/lib/ga"

type PricingViewTrackerProps = {
  children: React.ReactNode
  section?: string
}

export function PricingViewTracker({
  children,
  section = "pricing_section",
}: PricingViewTrackerProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasTrackedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && !hasTrackedRef.current) {
          hasTrackedRef.current = true

          trackEvent("pricing_view", {
            page_type: "landing",
            section,
          })

          observer.disconnect()
        }
      },
      {
        threshold: 0.35,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [section])

  return <div ref={ref}>{children}</div>
}