"use client"

import type React from "react"
import { trackEvent } from "@/lib/ga"

type MatrizDownloadedButtonProps = {
  children: React.ReactNode
  section?: string
  organizationId?: string
  organizationName?: string
}

export function MatrizDownloadedButton({
  children,
  section = "materiality_chart",
  organizationId,
  organizationName,
}: MatrizDownloadedButtonProps) {
  const handleClick = () => {
    trackEvent("matriz_downloaded", {
      page_type: "analysis",
      section,
      document_name: "matriz",
      organization_id: organizationId,
      organization_name: organizationName,
      file_type: "pdf",
    })
  }

  return <div onClick={handleClick}>{children}</div>
}