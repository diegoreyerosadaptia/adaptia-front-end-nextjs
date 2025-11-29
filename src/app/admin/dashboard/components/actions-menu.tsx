"use client"

import { useState } from "react"
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  // ============================
  // ESG para el gráfico (safe)
  // ============================
  const lastAnalysisEsg = org?.esgAnalysis?.length
    ? org.esgAnalysis[org.esgAnalysis.length - 1]
    : null

  let dataFinal: MaterialityInput[] = []

  if (showSendAnalysis && lastAnalysisEsg?.analysisJson) {
    const raw =
      typeof lastAnalysisEsg.analysisJson === "string"
        ? JSON.parse(lastAnalysisEsg.analysisJson)
        : lastAnalysisEsg.analysisJson

    // Puede venir como array por índice [3] o como lista de prompts
    let materialityTable: any[] = []

    if (Array.isArray(raw)) {
      materialityTable = raw[3]?.response_content?.materiality_table || []

      // Fallback por si cambió el orden y preferís buscar Prompt 6
      if (!materialityTable.length) {
        materialityTable =
          raw.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content
            ?.materiality_table || []
      }
    }

    const parteB = [...materialityTable]

    const parteBSorted = [...parteB].sort(
      (a, b) => Number(b.materialidad_esg ?? 0) - Number(a.materialidad_esg ?? 0),
    )

    dataFinal = parteBSorted.map((item) => {
      const tema = item.tema
      const materialidad = item.materialidad_financiera || item.materialidad || ""
      const materialidad_esg = Number(item.materialidad_esg ?? 0)

      let x = 0
      const fin = materialidad?.toLowerCase()

      if (fin === "baja") x = 1
      if (fin === "media") x = 3
      if (fin === "alta") x = 5

      return {
        tema,
        materialidad,
        materialidad_esg,
        x,
        y: materialidad_esg,
      }
    })
  }

  return (
    <>
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
            onClick={() => setIsDialogOpen(true)}
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
            <SendAnalysisButton id={lastAnalysis.id} accessToken={authToken || ""} shippingStatus={lastAnalysis.shipping_status} dataMaterialidad={dataFinal} />
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

      {isDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Detalles de la Organización</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Empresa</p>
                  <p className="text-base text-gray-900 font-semibold">{org.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Contacto</p>
                  <p className="text-base text-gray-900">
                    {org.name} {org.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-base text-gray-900">{org.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Industria</p>
                  <p className="text-base text-gray-900">{org.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">País</p>
                  <p className="text-base text-gray-900">{org.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Empleados</p>
                  <p className="text-base text-gray-900">{org.employees_number}</p>
                </div>
              </div>

              {org.analysis && org.analysis.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 font-medium mb-2">Análisis</p>
                  <div className="space-y-2">
                    {org.analysis.map((analysis, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Análisis #{idx + 1}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            analysis.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : analysis.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : analysis.status === "FAILED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {analysis.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
