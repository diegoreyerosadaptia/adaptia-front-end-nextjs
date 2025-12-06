"use client"

import { useState } from "react"
import { HowItWorksSection } from "./how-it-works-section"
import { AnalysisDrawer } from "./form-org/analysis-drawer"


export function HowItWorksWithDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <HowItWorksSection onOpenDrawer={() => setOpen(true)} />
      <AnalysisDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
