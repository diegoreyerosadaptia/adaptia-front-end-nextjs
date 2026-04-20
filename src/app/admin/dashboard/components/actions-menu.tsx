"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, FileText, Mail, RotateCcw } from "lucide-react"
import { Organization } from "@/types/organization.type"
import RetryEsgButton from "./retry-esg-button"
import SendAnalysisButton from "./send-analysis-button"
import { OrganizationInfoDialog } from "@/app/dashboard/components/organization-details-dialog"

interface ActionsMenuProps {
  org: Organization
  authToken?: string
}
interface MaterialityInput {
  tema?: string
  temas?: string[]
  materialidad?: string
  materialidad_esg?: number
  x?: number
  y?: number
}
export default function ActionsMenu({ org, authToken }: ActionsMenuProps) {
  const lastAnalysis = org.analysis?.length
    ? [...org.analysis].sort(
        (a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime(),
      )[0]
    : null

  const showViewAnalysis = lastAnalysis && lastAnalysis.status !== "PENDING" && lastAnalysis.status !== "FAILED"

  const showSendAnalysis = lastAnalysis && lastAnalysis.status === "COMPLETED"

  const showRetry = org.analysis?.some((a) => a.status === "FAILED")

  const canShowRetry =
  org.analysis?.some(
    (a: any) =>
      a.status === "COMPLETED" ||
      (a.status === "PENDING" && a.payment_status === "COMPLETED"),
  ) ?? false


  return (
    <>
      <OrganizationInfoDialog org={org} isAdmin>
        {(openDialog) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="hover:bg-blue-50 transition-colors">
            <MoreHorizontal className="h-5 w-5 text-blue-600" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg border border-gray-200">
          <DropdownMenuLabel className="px-3 py-2 text-gray-700 text-sm font-semibold">Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => openDialog()}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">Ver detalles</span>
          </DropdownMenuItem>

          {showViewAnalysis && (
            <DropdownMenuItem asChild className="mt-1">
              <Link
                href={`/dashboard/organization/${org.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">Ver análisis</span>
              </Link>
            </DropdownMenuItem>
          )}


          {showSendAnalysis && (
            <SendAnalysisButton id={lastAnalysis.id} accessToken={authToken || ""} shippingStatus={lastAnalysis.shipping_status} />
          )}

          {org.analysis?.some((a) => a.status === "FAILED") && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-1">
                    <RetryEsgButton org={org} label="Restaurar análisis" />
                  </div>
                </>
              )}


          {canShowRetry && (
            <>
              <DropdownMenuSeparator />
              <div className="px-1">
                <RetryEsgButton org={org} label="Realizar análisis" />
              </div>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>
        )}
      </OrganizationInfoDialog>
    </>
  )
}
