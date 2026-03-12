"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/ga"

export function LandingViewTracker() {
  useEffect(() => {
    trackEvent("landing_view", {
      page_type: "landing",
    })
  }, [])

  return null
}