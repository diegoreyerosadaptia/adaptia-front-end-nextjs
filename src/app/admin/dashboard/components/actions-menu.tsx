"use client"

import React from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import RetryEsgButton from "./retry-esg-button"
import { OrganizationInfoDialog } from "../../../dashboard/components/organization-details-dialog"
import { Organization } from "@/types/organization.type"
import SendAnalysisButton from "./send-analysis-button"

export default function ActionsMenu({
  org,
  authToken,
}: {
  org: Organization
  authToken: string
}) {
  const lastAnalysis = org.analysis?.length
    ? [...org.analysis].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null

  const showViewAnalysis =
    lastAnalysis && lastAnalysis.status !== "PENDING" && lastAnalysis.status !== "FAILED"

    const showSendAnalysis =
  lastAnalysis && lastAnalysis.status === "COMPLETED"


  return (
    <div className="flex justify-center">
      <OrganizationInfoDialog org={org}>
        {(openDialogFn) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-adaptia-blue-primary/10"
              >
                <MoreHorizontal className="h-5 w-5 text-adaptia-blue-primary" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 p-2 rounded-xl shadow-md border border-gray-100"
            >
              <DropdownMenuLabel className="px-2 text-gray-600 text-sm font-semibold">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* ✉️ Enviar análisis */}
              {showSendAnalysis && (
                <div className="px-1">
                  <SendAnalysisButton
                    id={lastAnalysis.id}
                    accessToken={authToken}
                    shippingStatus={lastAnalysis.shipping_status}
                  />
                </div>
              )}


              {/* 👁️ Ver detalles */}
              <DropdownMenuItem
                onClick={openDialogFn}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white transition-colors cursor-pointer mt-1"
              >
                <Eye className="w-4 h-4" />
                Ver detalles
              </DropdownMenuItem>

              {/* 📄 Ver análisis */}
              {showViewAnalysis && (
                <DropdownMenuItem asChild className="mt-1">
                  <Link
                    href={`/dashboard/organization/${org.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Ver análisis
                  </Link>
                </DropdownMenuItem>
              )}

              {/* 🔁 Reintentar análisis fallido */}
              {org.analysis?.some((a) => a.status === "FAILED") && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-1">
                    <RetryEsgButton org={org} />
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </OrganizationInfoDialog>
    </div>
  )
}
