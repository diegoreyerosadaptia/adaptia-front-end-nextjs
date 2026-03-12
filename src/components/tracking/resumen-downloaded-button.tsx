"use client"

import type React from "react"
import { trackEvent } from "@/lib/ga"

type ResumenDownloadedButtonProps = {
  children: React.ReactNode
  section?: string
  organizationId?: string
  organizationName?: string
}

export function ResumenDownloadedButton({
  children,
  section = "analysis_header",
  organizationId,
  organizationName,
}: ResumenDownloadedButtonProps) {
  const handleClick = () => {
    trackEvent("resumen_downloaded", {
      page_type: "analysis",
      section,
      document_name: "resumen",
      organization_id: organizationId,
      organization_name: organizationName,
      file_type: "pdf",
    })
  }

  return <div onClick={handleClick}>{children}</div>
}