"use client"

import type React from "react"
import { trackEvent } from "@/lib/ga"

type ReportDownloadedButtonProps = {
  children: React.ReactNode
  section?: string
  organizationId?: string
  organizationName?: string
}

export function ReportDownloadedButton({
  children,
  section = "analysis_header",
  organizationId,
  organizationName,
}: ReportDownloadedButtonProps) {
  const handleClick = () => {
    trackEvent("report_downloaded", {
      page_type: "analysis",
      section,
      document_name: "analisis_completo",
      organization_id: organizationId,
      organization_name: organizationName,
      file_type: "pdf",
    })
  }

  return <div onClick={handleClick}>{children}</div>
}