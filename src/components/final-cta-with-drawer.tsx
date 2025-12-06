"use client"

import { useState } from "react"
import { FinalCtaSection } from "./final-cta-section"
import { AnalysisDrawer } from "./form-org/analysis-drawer"


export function FinalCtaWithDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <FinalCtaSection onOpenDrawer={() => setOpen(true)} />
      <AnalysisDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
