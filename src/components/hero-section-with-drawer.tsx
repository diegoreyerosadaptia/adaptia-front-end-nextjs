"use client"

import { useState } from "react"
import { FinalCtaSection } from "./final-cta-section"
import { AnalysisDrawer } from "./form-org/analysis-drawer"
import { HeroSection } from "./hero-section"


export function HeroSectionDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <HeroSection onOpenDrawer={() => setOpen(true)} />
      <AnalysisDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
