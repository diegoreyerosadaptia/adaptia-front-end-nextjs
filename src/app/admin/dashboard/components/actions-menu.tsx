"use client"

import { useState } from "react"
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

export default function ActionsMenu({ org }: { org: Organization }) {
  const [openDialog, setOpenDialog] = useState(false)

  // 🧠 Obtener el último análisis (por fecha de creación)
  const lastAnalysis = org.analysis?.length
    ? [...org.analysis].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null

  // 🚫 Mostrar “Ver análisis” solo si NO está en estado PENDING
  const showViewAnalysis =
    lastAnalysis && lastAnalysis.status !== "PENDING" && lastAnalysis.status !== "FAILED"

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

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* 👁️ Ver detalles */}
              <DropdownMenuItem
                onClick={openDialogFn}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-adaptia-blue-primary" />
                Ver detalles
              </DropdownMenuItem>

              {/* 📄 Ver análisis — solo si el último no está pendiente */}
              {showViewAnalysis && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/organization/${org.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-adaptia-green-primary" />
                    Ver análisis
                  </Link>
                </DropdownMenuItem>
              )}

              {/* 🔁 Reintentar si hay análisis fallido */}
              {org.analysis?.some((a) => a.status === "FAILED") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <RetryEsgButton org={org} />
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </OrganizationInfoDialog>
    </div>
  )
}
